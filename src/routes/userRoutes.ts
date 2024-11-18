import {connectToDatabase} from "../dbUtils";
import {Router} from "express";
import {ReadUserRepository} from "../services/readUserRepository";
import {UserService} from "../services/userService";
import {WriteUserRepository} from "../services/writeUserRepository";

const configureUserRoutes = async (): Promise<Router> => {
    const router = Router();
    const connection = await connectToDatabase();
    const readUserRepository = new ReadUserRepository(connection);
    const writeUserRepository = new WriteUserRepository(connection);
    const userService = new UserService(readUserRepository, writeUserRepository);

    router.post('/users', async (req, res) => {
        const { email } = req.body;
        try {
            await userService.addUser(email);
            res.status(201).json({ message: 'User added successfully' });
        } catch (error: any) {
            if (error.message === 'Email already in use') {
                return res.status(409).json({ error: error.message });
            }
            console.error('Error adding user:', error);
            res.status(500).json({ error: 'Error adding user to the database' });
            }
    });

    return router;
};

export default configureUserRoutes;