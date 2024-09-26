import axios from 'axios';
import UserService from './user.service.js';
import bcrypt from 'bcrypt';
import AuthService from '../auth/auth.service.js';
import { REFRESH_TOKEN } from '../../constants/cookie-keys.constant.js';
import { createAccessToken } from '../../utils/utils.js';

const createNewUser = async (req, res) => {
    try {
        return res
            .status(201)
            .send({ success: true, message: 'User created successfully!' });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

const importEmployee = async (req, res) => {
    try {
        await importFromCron(res);
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
};

async function importFromCron(res) {
    try {
        console.log('Importing Employees...');
        const url = process.env.XEPST_EMPLOYEE_IMPORT_URL;
        const employeeData = await axios.get(url);
        if (
            employeeData &&
            employeeData.data &&
            employeeData.data.UserInfo &&
            employeeData.data.UserInfo.length
        ) {
            const employeeArrayToStore = [];
            await Promise.all(
                await employeeData.data.UserInfo.map(async (employee) => {
                    const encryptedPassword = await bcrypt.hash(
                        process.env.INITIAL_PASSWORD,
                        10
                    );
                    const preparedEmployeeData = prepareEmployeeData(
                        employee,
                        encryptedPassword
                    );
                    const existingEmployee =
                        await UserService.findUserByEmployeeId(
                            preparedEmployeeData.employeeId
                        );

                    if (existingEmployee) {
                        const employeeData = updateDataOfExistingEmployee(
                            preparedEmployeeData,
                            existingEmployee,
                            employee
                        );
                        await UserService.updateUserRecordsFromUser(
                            existingEmployee.employeeId,
                            employeeData
                        );
                    } else {
                        employeeArrayToStore.push(preparedEmployeeData);
                    }
                })
            );
            if (employeeArrayToStore.length) {
                await UserService.insertManyUsers(employeeArrayToStore);
            }
            console.log('Employee Imported Successfully');
            if (res) {
                res.status(200).json({
                    message: 'Employee Imported Successfully'
                });
            }
        } else {
            console.log('Employee record not found in xepst');
            if (res) {
                return res
                    .status(404)
                    .send({ message: 'Employee record not found in xepst' });
            }
        }
    } catch (error) {
        console.log(error);
        if (res) {
            return res
                .status(500)
                .send({ success: false, message: error.message });
        }
    }
}

function updateDataOfExistingEmployee(preparedData, employee, employeeFromUrl) {
    if (employee.personalDetails.profile) {
        preparedData.personalDetails.profile = employee.personalDetails.profile;
    }

    preparedData.personalDetails.gender = employee.personalDetails.gender;
    preparedData.personalDetails.nationality =
        employee.personalDetails.nationality;
    preparedData.personalDetails.citizenshipNumber =
        employee.personalDetails.citizenshipNumber;
    preparedData.contactDetails = employee.contactDetails;
    preparedData.contactDetails.country = employeeFromUrl.Country;

    return preparedData;
}

function prepareEmployeeData(employee, password) {
    const employeeObject = {
        userName: employee.Username,
        password,
        employeeId: employee.EmployeeID,
        status: employee.Status,
        supervisorId: employee.SupervisorCode,
        officeManager: employee.OfficeManager,
        permanent: employee.Permanent,
        permanentDate: employee.Permanentdate,
        email: employee.Email,
        personalDetails: {
            firstName: employee.FirstName,
            middleName: employee.MiddleName,
            lastName: employee.LastName,
            fullName: employee.FullName,
            dateOfJoinee: employee.Begindate,
            dateOfBirth: employee.BirthDate,
            designation: employee.Designation,
            departmentCode: employee.DepartmentCode,
            department: employee.Department,
            gender: employee.Gender,
            coeManager: employee.SupervisorID,
            country: employee.Country,
            contractEndDate: employee.Enddate
        },

        contactDetails: {
            number: employee.Mobile,
            homePhoneNo: employee.Phone,
            emailId: {
                official:
                    process.env.CURRENT_ENV === 'local'
                        ? process.env.STATIC_MAIL
                        : employee.Email
            },
            address: employee.Address
        }
    };
    return employeeObject;
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const validatedUser = await UserService.findActiveUserByEmail(email);
        let match = false;
        if (!validatedUser) {
            return res
                .status(404)
                .send({ success: false, message: 'Wrong Email!' });
        }
        match = await bcrypt.compare(password, validatedUser.password);
        if (!match) {
            return res
                .status(401)
                .send({ success: false, message: 'Invalid Credentials!' });
        }
        const refreshToken = await AuthService.createRefreshToken(
            req,
            validatedUser._id
        );
        AuthService.setCookie(REFRESH_TOKEN, refreshToken, res);
        const payload = {
            userName: validatedUser.userName,
            id: validatedUser._id
        };
        res.status(200).json({
            message: 'Login Successful',
            data: {
                accessToken: createAccessToken(payload)
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies[REFRESH_TOKEN];
        if (!refreshToken) {
            return res
                .status(401)
                .send({ success: false, message: 'No refresh token found' });
        }
        await AuthService.revokeRefreshToken(req, res);
        AuthService.destroyCookie(REFRESH_TOKEN, res);
        res.status(200).json({
            message: 'Employee Logout Successful',
            data: {
                userName: refreshToken
                    ? await AuthService.getUserNameFromRefreshToken(
                          refreshToken
                      )
                    : null
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: error.stack });
    }
};

const userController = {
    createNewUser,
    importEmployee,
    login,
    logout
};

export default userController;
