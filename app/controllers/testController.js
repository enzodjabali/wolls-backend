const Test = require('../models/Test');
const User = require('../models/User');
const { createTestSchema, updateTestSchema } = require('../middlewares/validationSchema');

const createTest = async (req, res) => {
    try {
        await createTestSchema.validateAsync(req.body);

        const currentUser = await User.findOne({_id: req.userId});

        if (currentUser.role == "ADMIN") {
            const test = new Test({
                name: req.body.name
            });

            test.save()
                .then(result => {
                res.status(201).json(result);
            })
                .catch (err => {
                    console.log(err);
                    res.status(500).json({ error: 'Internal Server Error' });
            });
        } else {
            res.status(403).json({ error: 'You do not have the suffisant privilieges to perform this action'})
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }     
};

const getAllTests = (req, res) => {
    const sortByName = req.params.sortByName == 'true' ? 1 : -1;

    Test.find().sort({ name: sortByName })
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' })
        });
};

const getSingleTest = (req, res) => {
    const id = req.params.id;

    Test.findById(id)
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err =>{
            console.log(err);
            res.status(404).json({ error: 'Test not found' });
        });
};

const updateTest = async (req, res) => {
    try {
        await updateTestSchema.validateAsync(req.body);
    
        const currentUser = await User.findOne({_id: req.userId});

        if (currentUser.role == "ADMIN") {
            const id = req.params.id;

            Test.findByIdAndUpdate(id , req.body)
                .then(result => {
                    if (result) {
                        res.status(200).send('Updated test successfully'); // 200 OK
                    } else {
                        res.status(404).json({ error: 'Test not found' }); // 404 Not Found
                    }
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' }); // 500 Internal Server Error
                });
        } else {
            res.status(403).json({ error: 'You do not have the suffisant privilieges to perform this action'})
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTest = async (req, res) => {
    const currentUser = await User.findOne({_id: req.userId});

    if (currentUser.role == "ADMIN") {
        const id = req.params.id;

        Test.findByIdAndDelete(id)
            .then(result => {
                res.send('Test deleted successful');
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.status(403).json({ error: 'You do not have the suffisant privilieges to perform this action'})
    }
};

module.exports = { createTest , getAllTests, getSingleTest ,updateTest, deleteTest };
