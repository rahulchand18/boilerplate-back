import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const Schema = mongoose.Schema;

const PersonalDetailSchema = new Schema({
    country: {
        type: String
    },
    title: {
        type: String
    },
    firstName: {
        type: String
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    dateOfJoinee: {
        type: Date
    },
    contractEndDate: {
        type: Date
    },
    designation: {
        type: String
    },
    departmentCode: {
        type: String
    },
    coeManager: {
        type: String
    },
    maritalStatus: {
        type: String
    },
    summary: {
        type: String
    },
    profile: {
        type: Object
    },
    permanent: {
        type: Boolean
    },
    permanentDate: {
        type: Date
    },
    department: {
        type: String
    },
    dateOfBirth: {
        type: String
    },
    gender: {
        type: String
    },
    fullName: {
        type: String
    }
});

const FileSchema = new Schema({
    path: {
        type: String
    },
    fileName: {
        type: String
    }
});

const ContactSchema = new Schema({
    number: {
        type: String
    },

    emailId: {
        official: {
            type: String
        },
        personal: {
            type: String
        }
    }
});

const PermissionAccessSchema = new Schema({
    fullReadOnlyAccess: {
        type: Boolean
    },
    fullAccess: {
        type: Boolean
    },
    highLevelAccess: {
        type: Boolean
    },
    mediumLevelAccess: {
        type: Boolean
    },
    lowLevelAccess: {
        type: Boolean
    }
});

const UserSchema = new Schema(
    {
        userName: {
            type: String,
            required: true
        },
        userType: {
            type: String
        },
        peerSelected: {
            type: Boolean,
            default: false
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String
        },
        salt: {
            type: String
        },
        officeManager: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            default: true
        },
        statusChanged: {
            type: Boolean,
            default: false
        },
        cardNumber: {
            type: String
        },
        employeeId: {
            type: String,
            required: true,
            unique: true
        },
        supervisorId: {
            type: String
        },
        permanent: {
            type: Boolean
        },
        permanentDate: {
            type: Date
        },
        employmentStatus: {
            type: String
        },
        personalDetails: PersonalDetailSchema,
        cvPersonal: [FileSchema],
        permissionAccess: PermissionAccessSchema,
        contactDetails: ContactSchema,

        verification: {
            type: String
        },
        verificationExpires: {
            type: Date,
            default: Date.now
        },
        blockExpires: {
            type: Date,
            default: Date.now
        },
        loginAttempts: {
            type: Number,
            default: 0
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

UserSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        const hashed = await bcrypt.hash(this['password'], 10);
        this['password'] = hashed;
        return next();
    } catch (err) {
        return next(err);
    }
});

const UserModel = mongoose.model('employee', UserSchema);
export default UserModel;
