## DJ André Marques

After his hibernation occurred by VideoShow, the god has finnally awake and he plays disco smoking cigarettes! 🙌

Just a ordinary discord bot to listen songs with your friends on your ordinary server (pls youtube don't process me 🥲)

[Summon in your discord](https://discord.com/api/oauth2/authorize?client_id=888590468995239976&permissions=326454426944&scope=bot%20applications.commands)

## Preparing summoning ceremmony

There is only three steps you should follow to summon the greatest André Marques. First, create the file where the prohibited words will remain (create **.env** file). Second, insert the secret passed by the ancient gods to communicate with us mortals (create a discord bot on [discord developers portal](https://discord.com/developers/applications) and insert the **bot token** on _.env_ file how is it in the .env.example file). Finnaly, enter the big communication company services and hack their credentials (create a new Google project, add the _Youtube API v3_ service and insert **youtube token** on .env).

### Making the ceremmony

The Andre M. only works inside his summoning circle. To draw and activate the circle, you have to execute these lines below.

```
$ docker build . -t dj
$ docker run -p 3000:3000 --env-file .env dj
```

If you have the latest tecnologies of automation, you can simply run:

```
$ docker-compose up
```