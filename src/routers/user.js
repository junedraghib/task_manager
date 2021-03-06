const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

//create a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

// get user by id from the browser
router.get('/users/me',auth , (req, res) => {
    // const _id = req.user._id // Access the id provided
    // User.findById(_id).then((user) => {
    //     if (!user) {
    //         return res.status(404).send()
    //     }
    //     res.send(user)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })
    res.send(req.user)
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        
        res.status(200).send(user)
    } catch (e) {
        res.status(401).send(e)
    }
})

// router.patch('/users/me',auth , async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) =>
//         allowedUpdates.includes(update))
//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid update Operation!' })
//     }

//     try {
//         const user = await User.findByIdAndUpdate(req.user._id, req.body, {new: true, runValidators: true })
        
//         if (!user) {
//             return res.status(404).send("user doesnt exist")
//         }

//         // updates.forEach((update) => req.user[update] = req.body[update])
//         // await req.user.save()
//         res.send(user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete a user using id
router.delete('/users/me',auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)
        if (!user) {
            return res.status(404).send("deleted successfully!!")
        }
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router