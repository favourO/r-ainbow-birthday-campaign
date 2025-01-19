<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Built with NestJS
[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">


## Description

[Rainbow Birthday Campaign](https://github.com/nestjs/nest) - The Birthday Discount Campaign system is designed to send personalized birthday discount emails to customers a week before their birthday. The email includes a unique discount code and personalized product recommendations. Additionally, during the birthday week, the app displays the same suggested products when the customer accesses it.

A detailed explanation for the projects is the PDF file birthdaycampaign.pdf

## Project setup

### Prerequisites
•	Node.js: v14.x or later
•	npm: v6.x or later
•	Docker: Installed and running
•	Git: Installed


```bash
$ git clone https://github.com/favourO/r-ainbow-birthday-campaign.git
$ npm install
$ cd r-ainbow-birthday-campaign

add env file
$ touch .env
paste the following

DATABASE_URL=postgresql://postgrs:123456@localhost:5432/rainbow?schema=public

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=add-your-email@gmail.com
SMTP_PASS=add-your-app-password
EMAIL_FROM=add-your-email@gmail.com

Note that App Password is not your normal Gmail password 
To find your App password in gmail 
- Go to https://myaccount.google.com/security
- Enable two factor authentication
- Generate App password
```

## Compile and run the project

```bash
# development 
$ npm run start:all 

# This script (can be found in package.json) cleans all existing docker container if there are any
# Builds a new Postgres container for the DB
# Generate prisma schema or overwrites existing one
# Starts the docker container
# Sleeps for 1 second to give the docker time to boot
# Runs DB Prisma migrate for DB
# Loads Seed data into DB for testing
# Finally starts the nest project in Development
```

## Endpoints
Base Url - http://localhost:3000/
- The Campaign is controlled by Cron Job that runs everyday at MIDNIGHT, to test immediately go to scheduler service and change it to every 10 seconds
- The Cron Job starts once the app has launched
- This is the api to recommend products to users once the app (frontend can consume the api onInit) launches
    - http://localhost:3000/recommendations/:userId
- For Running campaigns manually
    - http://localhost:3000/campaign/run-birthday-campaign
- Get All Products
    - http://localhost:3000/products/
- Get One 
    - http://localhost:3000/products/{:id}
- Get Users
    - http://localhost:3000/users/

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE). Favour Ojiaku
# r-ainbow-birthday-campaign
