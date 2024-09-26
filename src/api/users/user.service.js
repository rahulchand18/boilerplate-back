import UserModel from './users.model.js';

const createNewUser = async (userData) => {
    return await UserModel.create(userData);
};

const findUserByEmployeeId = async (employeeId) => {
    return await UserModel.findOne({ employeeId });
};

const updateUserRecordsFromUser = async (employeeId, newRecord) => {
    return await UserModel.updateOne({ employeeId }, { $set: newRecord });
};

const insertManyUsers = async (bulkEmployeeData) => {
    const newEmployeeList = await UserModel.insertMany(bulkEmployeeData);
    return newEmployeeList;
};

const findUserById = async (id) => {
    return await UserModel.findById(id);
};

const findActiveUserByEmail = async (email) => {
    return await UserModel.findOne({ email, status: 'ACT' });
};

const UserService = {
    createNewUser,
    findUserByEmployeeId,
    updateUserRecordsFromUser,
    insertManyUsers,
    findUserById,
    findActiveUserByEmail
};

export default UserService;
