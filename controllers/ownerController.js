import imagekit from '../configs/imagekit.js';
import User from '../models/User.js';
import Car from '../models/Car.js';
import * as fs from 'node:fs';

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
		const optimizedImageUrl = imagekit.url({
			path: response.filePath,
			transformation: [
				{ width: '1280' },  //width size
				{ quality: 'auto' },  // compress
				{ format: 'webp' }, // convert modern file			],
		]});
        const image = optimizedImageUrl;
        await Car.create({...car,owner:_id,image})
        res.json({success:true,message:"Car Added Successfully."})
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};
