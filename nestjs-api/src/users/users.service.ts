import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async onModuleInit() {
        const adminEmail = 'admin@example.com';
        const existingAdmin = await this.userModel.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            await this.userModel.create({
                email: adminEmail,
                password: hashedPassword,
            });
            console.log('Default admin user created');
        }
    }

    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });
        return createdUser.save();
    }

    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find().exec();
    }

    async findOne(email: string): Promise<UserDocument | undefined> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<User | undefined> {
        return this.userModel.findById(id).exec();
    }

    async update(id: string, updateUserDto: any): Promise<User> {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    }

    async remove(id: string): Promise<User> {
        return this.userModel.findByIdAndDelete(id).exec();
    }
}
