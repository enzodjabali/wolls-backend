# Good friends backend

Install npm packages:
``docker compose run api npm --prefix /app install``

Start:
``docker compose up``

That's it. Your API is now available on ``127.0.0.1:3000`` 🎉

<hr>

Swagger is accessible on ``127.0.0.1:3000/api-docs``

<hr>

Mongo Express is accessible on ``127.0.0.1:3001``

Mongo Express credentials:
<br>
User: ``root``
<br>
Password: ``24UKMZ5xrgUQWhQKP9qa9A9``

<hr>

Connect to the prod server :

``ssh -p37538 goodfriends@141.94.244.54``

Password: ``G08!f3n8@2/``

Update the prod app :

``cd goodfriends-backend``

``git pull``

``docker compose run api npm --prefix /app install``

``docker compose up -d``

That's it!