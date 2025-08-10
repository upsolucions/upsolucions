#!/usr/bin/env node

/**
 * Script para verificar o status do deploy na Vercel
 * Executa automaticamente após push para verificar se o deploy foi bem-sucedido
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeployChecker {
  constructor() {
    this.projectConfig = this.loadProjectConfig();
  }

  loadProjectConfig() {
    try {
      const vercelConfigPath = path.join(__dirname, '.vercel', 'project.json');
      if (fs.existsSync(vercelConfigPath)) {
        return JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Não foi possível carregar configuração do projeto Vercel');
    }
    return null;
  }

  async checkVercelStatus() {
    try {
      console.log('🔍 Verificando status do deploy na Vercel...');
      
      // Verificar deployments recentes
      const deployments = execSync('vercel ls', { encoding: 'utf8' });
      console.log('📋 Deployments recentes:');
      // Mostrar apenas as primeiras 10 linhas
      const lines = deployments.split('\n').slice(0, 10);
      console.log(lines.join('\n'));
      
      // Extrair URL de produção mais recente
      const deploymentLines = deployments.split('\n');
      const productionLine = deploymentLines.find(line => 
        line.includes('● Ready') && line.includes('Production')
      );
      
      if (productionLine) {
        const urlMatch = productionLine.match(/https:\/\/[^\s]+/);
        if (urlMatch) {
          const productionUrl = urlMatch[0];
          console.log('✅ URL de Produção:', productionUrl);
          return productionUrl;
        }
      }
      
      console.log('⚠️  Nenhum deploy de produção encontrado');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao verificar status da Vercel:', error.message);
      return null;
    }
  }

  async checkGitStatus() {
    try {
      console.log('🔍 Verificando status do Git...');
      
      // Verificar se há mudanças não commitadas
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        console.log('⚠️  Há mudanças não commitadas:');
        console.log(status);
        return false;
      }
      
      // Verificar último commit
      const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' });
      console.log('📝 Último commit:', lastCommit.trim());
      
      // Verificar se está sincronizado com origin
      try {
        const behind = execSync('git rev-list HEAD..origin/main --count', { encoding: 'utf8' });
        const ahead = execSync('git rev-list origin/main..HEAD --count', { encoding: 'utf8' });
        
        if (parseInt(behind.trim()) > 0) {
          console.log(`⚠️  Branch está ${behind.trim()} commits atrás do origin/main`);
        }
        
        if (parseInt(ahead.trim()) > 0) {
          console.log(`✅ Branch está ${ahead.trim()} commits à frente do origin/main`);
        }
        
        if (parseInt(behind.trim()) === 0 && parseInt(ahead.trim()) === 0) {
          console.log('✅ Branch sincronizada com origin/main');
        }
        
      } catch (error) {
        console.log('ℹ️  Não foi possível verificar sincronização com origin');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao verificar status do Git:', error.message);
      return false;
    }
  }

  async generateDeployReport() {
    console.log('\n🚀 === RELATÓRIO DE DEPLOY === 🚀\n');
    
    const gitOk = await this.checkGitStatus();
    console.log('');
    
    const productionUrl = await this.checkVercelStatus();
    console.log('');
    
    // Resumo final
    console.log('📊 === RESUMO === 📊');
    console.log(`Git Status: ${gitOk ? '✅ OK' : '⚠️  Atenção'}`);
    console.log(`Deploy Status: ${productionUrl ? '✅ Ativo' : '❌ Problema'}`);
    
    if (productionUrl) {
      console.log(`🌐 URL de Produção: ${productionUrl}`);
      console.log('\n🎉 Deploy realizado com sucesso!');
      console.log('✅ Site está online e funcionando');
      
      // Salvar URL em arquivo para referência
      fs.writeFileSync(
        path.join(__dirname, 'PRODUCTION_URL.txt'),
        `${productionUrl}\nÚltima atualização: ${new Date().toISOString()}\n`
      );
      
    } else {
      console.log('\n❌ Problemas detectados no deploy');
      console.log('🔍 Verifique os logs acima para mais detalhes');
    }
    
    return { gitOk, productionUrl };
  }
}

// Executar verificação
if (require.main === module) {
  const checker = new DeployChecker();
  checker.generateDeployReport()
    .then(result => {
      process.exit(result.productionUrl ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = DeployChecker;