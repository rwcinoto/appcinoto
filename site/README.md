# Página de divulgação do Numix

Esta pasta contém os arquivos da página de divulgação do sistema Numix.

## Arquivos

- `index.html` - Página principal de divulgação

## Como usar

1. Faça upload do arquivo `index.html` para a pasta `cinoto.com.br/numix` no seu servidor via FTP
2. Adicione as imagens dos prints do sistema nos lugares indicados na página

## Adicionando imagens

Na página HTML, existem dois lugares marcados para você adicionar imagens:

1. **Imagem da tela de novo treino**: Substitua o placeholder pela tag `<img>` com o caminho da sua imagem
2. **Imagem do menu do sistema**: Substitua o placeholder pela tag `<img>` com o caminho da sua imagem

Exemplo de como adicionar uma imagem:

```html
<div class="image-placeholder">
    <img src="imagens/novo-treino.png" alt="Tela de novo treino do Numix">
</div>
```

## Estrutura sugerida de pastas no servidor

```
cinoto.com.br/
  └── numix/
      ├── index.html
      └── imagens/
          ├── novo-treino.png
          └── menu.png
```

Se você adicionar as imagens em uma subpasta `imagens`, lembre-se de atualizar os caminhos no HTML.

