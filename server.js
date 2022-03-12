const path = require('path')
const express = require('express');
const session = require('express-session');
const routes = require('./controllers');
const exphbs = require('express-handlebars');
const helpers = require('./utils/helpers');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sess = {
    secret: 'shhh its a secret',
    cookie: { maxAge: 100000},
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
      db: sequelize
    })
};

app.use(session(sess));

const hbs = exphbs.create({ helpers });
// configure handlebars
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
    sequelize.sync({ force: false });
});
