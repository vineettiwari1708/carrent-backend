import imagekit from '../configs/imageKit.js';
import User from '../models/User.js';
import Car from '../models/Car.js';
import fs from 'fs';
import Booking from '../models/Booking.js';

//api to change role of user
export const changeRoleToOwner = async (req, res) => {
	try {
		const { _id } = req.user;
		await User.findByIdAndUpdate(_id, { role: 'owner' });
		res.json({ success: true, message: 'Now you can list cars.' });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

//api to list car
export const addCar = async (req, res) => {
	try {
		const { _id } = req.user;
		let car = JSON.parse(req.body.carData);
		const imageFile = req.file;
		//upload image to image kit
		const fileBuffer = fs.readFileSync(imageFile.path);
		const response = await imagekit.upload({
			file: fileBuffer,
			fileName: imageFile.originalname,
			folder: '/cars',
		});
		//for url generation, work for both image and video
		var optimizedImageUrl = imagekit.url({
			path: response.filePath,
			transformation: [
				{ width: '1280' }, //width size
				{ quality: 'auto' }, // compress
				{ format: 'webp' }, // convert modern file			],
			],
		});
		const image = optimizedImageUrl;
		await Car.create({ ...car, owner: _id, image });
		res.json({ success: true, message: 'Car Added Successfully.' });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

//api to list of onwer cars
export const getOwnerCars = async (req, re) => {
	try {
		const { _id } = req.user;
		const cars = await Car.find({ owners: _id });
		res.json({ success: true, cars });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

// api to toggle car avail
export const toggleCarAvailability = async (req, re) => {
	try {
		const { _id } = req.user;
		const { carId } = req.body;
		const car = await Car.findById(carId);
		//checking car belong to user
		if (car.owner.toString() !== _id.toString()) {
			return res.json({ success: false, message: 'unauthorized' });
		}
		car.isAvailable = !car.isAvailable;
		await car.save();
		res.json({ success: true, message: 'Availability Toggled' });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

//api to delete a car
export const deleteCar = async (req, re) => {
	try {
		const { _id } = req.user;
		const { carId } = req.body;
		const car = await Car.findById(carId);
		//checking car belong to user
		if (car.owner.toString() !== _id.toString()) {
			return res.json({ success: false, message: 'unauthorized' });
		}
		car.owner = null;
		car.isAvailable = false;
		await car.save();
		res.json({ success: true, message: 'Car Removed' });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

//api to get dashboard data
export const getDashboardData = async (req, res) => {
	try {
		const {_id,role}=req.user;
		if(role!=='owner'){
			return res.json({success:false,message:"unauthorised"})
		}
		const cars = await Car.find({owner:_id})
		const bookings = await Booking.find({owner:_id}).populate('car').sort({createdAt:-1});
		const pendingBookings=await Booking.find({owner:_id,status:"pending"})
		const completeBookings=await Booking.find({owner:_id,status:"confirmed"})
		//calculate monthly revenue from booking where status is confirmed
		const monthlyRevenue = bookings.slice().filter(booking=>booking.status==='confirmed').reduce((acc,booking)=>acc+booking.price,0)
		const dashboardData ={
			totalCars : cars.length,
			totalBookings:bookings.length,
			pendingBookings:pendingBookings.length,
			completeBookings:completeBookings.length,
			recentBookings:bookings.slice(0,3),
			monthlyRevenue
		}
		res.json({success:true,dashboardData});
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};
//api to update image 
export const updateUserImage = async (req, res) => {
	try {
		const {_id,role}=req.user;
		const imageFile = req.file;
		//upload image to image kit
		const fileBuffer = fs.readFileSync(imageFile.path);
		const response = await imagekit.upload({
			file: fileBuffer,
			fileName: imageFile.originalname,
			folder: '/users',
		});
		//for url generation, work for both image and video
		var optimizedImageUrl = imagekit.url({
			path: response.filePath,
			transformation: [
				{ width: '400' }, //width size
				{ quality: 'auto' }, // compress
				{ format: 'webp' }, // convert modern file			],
			],
		});
		const image = optimizedImageUrl;
		await User.findByIdAndUpdate(_id,{image});
		res.json({success:true,message:"image Updated"})
		
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};