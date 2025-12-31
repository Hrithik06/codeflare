import { Error, Schema, model } from "mongoose";
import jwt, { Secret } from "jsonwebtoken";
import { UserDocument, ProfileImageMeta } from "../types/dbInterfaces.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { config } from "../config/config.js";

const userSchema = new Schema<UserDocument>(
	{
		firstName: {
			type: String,
			required: true,
			minlength: 2,
			trim: true,
			maxlength: 20,
		},
		lastName: {
			type: String,
			required: true,
			minlength: 1,
			trim: true,
			maxlength: 20,
		},
		emailId: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			validate: (value: string) => {
				if (!validator.isEmail(value)) {
					throw new Error("Email address is invalid format.");
				}
			},
		},
		password: {
			type: String,
			required: true,
			trim: true,
			validate: (value: string) => {
				if (!validator.isStrongPassword(value)) {
					throw new Error("Enter a strong password");
				}
			},
		},
		dateOfBirth: {
			type: Date,
		},
		age: {
			type: Number,
			min: 15,
			max: 120,
		},
		//can also make this as enum for validation
		gender: {
			type: String,
			trim: true,
			// required: true,
			validate: (value: string) => {
				if (!["Man", "Woman", "Non-binary"].includes(value)) {
					throw new Error(
						"Gender data is invalid. Allowed values: 'Man', 'Woman', 'Non-binary'.",
					);
				}
			},
		},
		profileImageMeta: {
			key: {
				type: String,
				trim: true,
			},
			contentType: {
				type: String,
				trim: true,
			},
			isUserUploaded: {
				type: Boolean,
				default: false,
			},
			imageVersion: {
				type: Number,
			},
		},
		about: {
			type: String,
			trim: true,
		},
		skills: { type: [String] },
	},
	{ timestamps: true },
);

//this keyword points the current instance of the userSchema
//any new user is a instance of userSchema
userSchema.methods.getJWT = function () {
	const JWT_SECRET_KEY: Secret = config.JWT_SECRET_KEY;

	const user = this;
	const token = jwt.sign({ _id: user._id }, JWT_SECRET_KEY);
	return token;
};
2025;
userSchema.methods.matchPassword = async function (
	passwordInputByUser: string,
) {
	const passwordHashFromDB = this.password;
	const isMatch = await bcrypt.compare(passwordInputByUser, passwordHashFromDB);
	return isMatch;
};

userSchema.methods.ageCalculate = function (dob: Date) {
	const today = new Date();
	const birthDate = new Date(dob);
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();

	// Adjust age if the birth date hasn't occurred yet this year
	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getDate() < birthDate.getDate())
	) {
		age--;
	}
	return age;
};

userSchema.pre("save", async function (next) {
	if (this.dateOfBirth) {
		this.age = this.ageCalculate(this.dateOfBirth);
	}
	next();
});

// Update dateOfBirth and age
userSchema.pre("findOneAndUpdate", async function (next) {
	//Get the document to be updated from DB
	try {
		//Get the update document from client
		const update = this.getUpdate() as Partial<UserDocument>;

		// update object doesn't have dateOfBirth then early return
		if (!update.dateOfBirth) return;

		const docToUpdate = (await this.model.findOne(
			this.getFilter(),
			"dateOfBirth",
		)) as UserDocument;

		const docDOB = Date.parse(docToUpdate.dateOfBirth?.toString());
		const updateDOB = Date.parse(update.dateOfBirth.toString());
		//If both dateOfBirth are same early return no changes to be made
		if (docDOB === updateDOB) return;

		// if there is change in dateOfBirth then proceed
		const age = docToUpdate.ageCalculate(update.dateOfBirth);
		this.set({ age: age });

		next();
	} catch (err: any) {
		next(err);
	}
});
const UserModel = model<UserDocument>("User", userSchema);
export default UserModel;
