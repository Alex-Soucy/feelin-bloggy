const router = require('express').Router();
const { User } = require('../../models');

// Get all users
router.get('/', (req, res) => {
    User.findAll({
      attributes: { exclude: ['password'] }
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/', (req, res) => {
    User.create({
      username: req.body.username,
      password: req.body.password
    })
    .then(dbUserData => {
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;
  
        res.json(dbUserData)
      })
    })    
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// route for login
router.post('/login', (req, res) => {
    User.findOne({
      where: {
        username: req.body.username
      }
    })
    .then(dbUserData => {
      // verify user
      if(!dbUserData) {
        res.status(400).json({ message: 'User not Found' });
        return;
      }
      // verify password
      const validPassword = dbUserData.checkPassword(req.body.password);
      if (!validPassword) {
        res.status(400).json({ message: 'Incorrect Password!' });
        return;
      }
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;
        res.json({user: dbUserData, message: 'You are now logged in!' });
      });
    });
});

// route for logout
router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
      req.session.destroy(() => {
        res.status(204).end();
      });
    } else {
      res.status(404).end();
    }
});

// route to update user by id
router.put('/:id', (req, res) => {
    User.update(req.body, {
      individualHooks: true,
      where: {
        id: req.params.id
      }
    })
    .then(dbUserData => {
      if (!dbUserData[0]) {
        res.status(404).json({ message: 'Not a valid user id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// route to delete a user by id
router.delete('/:id', (req, res) => {
    User.destroy({
      where: {
        id: req.params.id
      }
    })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({ message: 'No User found with this id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});


module.exports = router;