## DJ André Marques

[link para adicionar no discord](https://discord.com/api/oauth2/authorize?client_id=888590468995239976&permissions=326454426944&scope=bot%20applications.commands)

## Configurações

É necessário configurar duas variáveis de ambiente em um arquivo `.env`. Elas estão descritas no arquivo `.env.example`, são o **token do bot** e o 
**token do youtube**. O **token do bot** pode ser obtido na aba Bot no [portal do desenvolvedor](https://discord.com/developers/applications). Já o **token do youtube**
é obtido ao criar um projeto no Google e adicionando o serviço _Youtube API v3_.

### Rodando com Docker

```
$ docker build . -t dj
$ docker run -p 3000:3000 --env-file .env dj
```