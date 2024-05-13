<br>
<img src="https://media.discordapp.net/attachments/774340712585625603/1239547702824534016/image.png?ex=66435242&is=664200c2&hm=f85b33b45de42cfbccd7b26903bfe4c0e5e1d9a3dbaf2205783f93efd3fac1c6&=&format=webp&quality=lossless&width=2096&height=252" height="50" />

<p float="left">
    <img src="https://img.shields.io/static/v1?label=License&message=MIT&color=blue">
    <img src="https://img.shields.io/static/v1?label=Version&message=0.3&color=blue">
</p>

Manage shared expenses with Goodfriends.
A full JavaScript app developed using Node.js, MongoDB, React, and React Native.
Declare expenses, balance accounts, and track reimbursements effortlessly. 
Features include group creation, expense declaration, reimbursement calculation, payment options, and instant messaging. 
Export summaries and view expense statistics. Simplify expense management for any group.

## Deploy locally the project with docker 🐳

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

Minio S3 is accessible on ``127.0.0.1:9161``

Minio S3 creditentials:
<br>
User: ``root``
<br>
Password: ``hhcXPJRm0h91bzC6qtLG5U``

<hr>

Related projects:<br>
Web: https://github.com/enzodjabali/goodfriends-web<br>
Mobile: https://github.com/enzodjabali/goodfriends-mobile

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

<img src="https://media.discordapp.net/attachments/774340712585625603/1239548866936967189/image.png?ex=66435357&is=664201d7&hm=bfc645ffcab272e3595e933dba0e4f3578bc076deb2feee0def4b2744fed09d3&=&format=webp&quality=lossless&width=852&height=700" height="200" />
