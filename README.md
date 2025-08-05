# Up Solucions - Website

Site institucional da Up Solucions desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

## 🚀 Deploy no Vercel

### Pré-requisitos
1. Conta no [Vercel](https://vercel.com)
2. Projeto Supabase configurado
3. Repositório no GitHub

### Passos para Deploy

1. **Conectar ao Vercel**:
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub
   - Clique em "New Project"
   - Selecione o repositório `upsolucions/upsolucions`

2. **Configurar Variáveis de Ambiente**:
   No painel do Vercel, adicione as seguintes variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_TELEMETRY_DISABLED=1
   NODE_OPTIONS=--max-old-space-size=4096
   ```

3. **Deploy Automático**:
   - O Vercel detectará automaticamente que é um projeto Next.js
   - O deploy será iniciado automaticamente
   - Aguarde a conclusão (aproximadamente 2-3 minutos)

## 🛠️ Desenvolvimento Local

### Instalação
```bash
npm install
```

### Configuração
1. Copie `.env.example` para `.env.local`
2. Configure as variáveis do Supabase
3. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

### Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificação de código

## 📁 Estrutura do Projeto

```
├── app/                 # App Router (Next.js 14)
│   ├── admin/          # Área administrativa
│   ├── cliente/        # Área do cliente
│   ├── galeria/        # Galeria de imagens
│   ├── orcamento/      # Página de orçamento
│   ├── servicos/       # Página de serviços
│   └── solucoes/       # Página de soluções
├── components/         # Componentes React
│   ├── admin/         # Componentes administrativos
│   ├── cliente/       # Componentes do cliente
│   └── ui/            # Componentes de interface
├── contexts/          # Contextos React
├── hooks/             # Custom hooks
├── lib/               # Utilitários e serviços
├── public/            # Arquivos estáticos
├── scripts/           # Scripts SQL
├── styles/            # Estilos globais
└── types/             # Definições TypeScript
```

## 🔧 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Banco de Dados**: Supabase
- **UI Components**: shadcn/ui
- **Deploy**: Vercel

## 📝 Funcionalidades

- ✅ Site institucional responsivo
- ✅ Área administrativa para gerenciamento
- ✅ Área do cliente personalizada
- ✅ Galeria de imagens
- ✅ Sistema de orçamentos
- ✅ Upload e gerenciamento de imagens
- ✅ Otimizações de performance
- ✅ SEO otimizado

## 🚀 Performance

- **Turbo Mode** habilitado para compilação rápida
- **SWC Minify** para otimização de bundle
- **Lazy Loading** para componentes pesados
- **Code Splitting** automático
- **Image Optimization** nativa do Next.js

## 📞 Suporte

Para suporte técnico, entre em contato:
- Email: contato@upsolucions.com
- Website: [upsolucions.com](https://upsolucions.com)