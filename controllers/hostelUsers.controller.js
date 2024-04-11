const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const HostelUser = require('../models/hostelUsers');
const jwt = require('jsonwebtoken');
const Room = require('../models/rooms')



// Function to calculate end date based on billing cycle and billing date
const calculateEndDate = (billingCycle, billingDate) => {
    // Convert billing date to JavaScript Date object
    const startDate = new Date(billingDate);

    // Initialize end date
    let endDate;

    // Calculate end date based on billing cycle
    switch (billingCycle) {
        case 'monthly':
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            break;
        case 'quarterly':
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 3);
            break;
        case 'yearly':
            endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
        default:
            throw new Error('Invalid billing cycle');
    }

    return endDate;
};


// const createHostelUser = async (req, res) => {
//     try {
//         const { floor, room, bed, paymentType, amount, billingCycle, billingDate, ...userData } = req.body;
//         const userId = req.userId;

//         // Convert floor and room IDs to ObjectId
//         const floorId = new ObjectId(floor);
//         const roomId = new ObjectId(room);

//         // Find the room in the database
//         const foundRoom = await Room.findById(roomId);
//         if (!foundRoom) {
//             return res.status(404).json({ message: 'Room not found' });
//         }

//         // Check if the bed is available
//         const isBedAvailable = foundRoom.beds.some(b => b.bedNumber === bed && b.status === 'available');
//         if (!isBedAvailable) {
//             return res.status(400).json({ message: 'Bed not available' });
//         }

//         // Update bed status to 'occupied' only if creation is successful
//         foundRoom.beds.find(b => b.bedNumber === bed).status = 'occupied';

//         // Calculate end date based on billing cycle and billing date
//         const endDate = calculateEndDate(billingCycle, billingDate);

//         // Creating new hostel user...
//         const hostelUser = new HostelUser({
//             ...userData,
//             userId,
//             floor: floorId,
//             room: roomId,
//             bed,
//             paymentType,
//             amount,
//             billingCycle,
//             billingDate,
//             endDate // Add the end date to the user object
//         });

//         // Save the hostel user to the database
//         await hostelUser.save();

//         // If hostel user creation is successful, send status 201 and update bed status
//         res.status(201).json({ ...hostelUser.toJSON(), endDate });

//         // Save the updated room with the occupied bed status
//         await foundRoom.save();
//     } catch (error) {
//         console.error('Error creating hostel user:', error);
//         res.status(400).json({ message: error.message });
//     }
// };


const createHostelUser = async (req, res) => {
    try {
        const { floor, room, bed, paymentType, amount, billingCycle, billingDate, ...userData } = req.body;
        const userId = req.userId;

        // Generate a random 5-digit number for user reference ID
        const userReferenceId = generateRandomUserReferenceId();
        console.log('Generated user reference ID:', userReferenceId);

        // Convert floor and room IDs to ObjectId
        const floorId = new ObjectId(floor);
        const roomId = new ObjectId(room);

        // Find the room in the database
        const foundRoom = await Room.findById(roomId);
        if (!foundRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if the bed is available
        const isBedAvailable = foundRoom.beds.some(b => b.bedNumber === bed && b.status === 'available');
        if (!isBedAvailable) {
            return res.status(400).json({ message: 'Bed not available' });
        }

        // Update bed status to 'occupied' only if creation is successful
        foundRoom.beds.find(b => b.bedNumber === bed).status = 'occupied';

        // Calculate end date based on billing cycle and billing date
        const endDate = calculateEndDate(billingCycle, billingDate);

        // Creating new hostel user...
        const hostelUser = new HostelUser({
            ...userData,
            userId,
            floor: floorId,
            room: roomId,
            bed,
            paymentType,
            amount,
            billingCycle,
            billingDate,
            endDate, // Add the end date to the user object
            userReferenceId // Add the generated user reference ID to the user object
        });

        console.log('Hostel user before saving:', hostelUser); // Log the hostel user before saving

        // Save the hostel user to the database
        await hostelUser.save();

        // If hostel user creation is successful, send status 201 and update bed status
        res.status(201).json({ ...hostelUser.toJSON(), endDate, userReferenceId }); // Include user reference ID in the response

        // Save the updated room with the occupied bed status
        await foundRoom.save();
    } catch (error) {
        console.error('Error creating hostel user:', error);
        res.status(400).json({ message: error.message });
    }
};

// Function to generate random 5-digit user reference ID
const generateRandomUserReferenceId = () => {
    return Math.floor(10000 + Math.random() * 90000);
};





// Middleware function to verify JWT token

// const createHostelUser = async (req, res) => {
//     try {
//         const { floor, room, bed,paymentType, amount, ...userData } = req.body;
//         const userId = req.userId;

//         // Convert floor and room IDs to ObjectId
//         const floorId = new ObjectId(floor);
//         const roomId = new ObjectId(room);

//         // Find the room in the database
//         const foundRoom = await Room.findById(roomId);
//         if (!foundRoom) {
//             return res.status(404).json({ message: 'Room not found' });
//         }

//         // Check if the bed is available
//         const isBedAvailable = foundRoom.beds.some(b => b.bedNumber === bed && b.status === 'available');
//         if (!isBedAvailable) {
//             return res.status(400).json({ message: 'Bed not available' });
//         }

//         // Update bed status to 'occupied' only if creation is successful
//         foundRoom.beds.find(b => b.bedNumber === bed).status = 'occupied';

//         // Creating new hostel user...
//         const hostelUser = new HostelUser({
//             ...userData,
//             userId,
//             floor: floorId,
//             room: roomId,
//             bed,
//             paymentType,
//             amount
//         });

       

//         // Save the hostel user to the database
//         await hostelUser.save();

//         // If hostel user creation is successful, send status 201 and update bed status
//         res.status(201).json(hostelUser);

//         // Save the updated room with the occupied bed status
//         await foundRoom.save();
//     } catch (error) {
//         console.error('Error creating hostel user:', error);
//         res.status(400).json({ message: error.message });
//     }
// };



const assignBed = async (floorId, roomId, bedNumber) => {
    try {
        const room = await Room.findOne({ _id: roomId, floor: floorId });
        if (!room) {
            throw new Error('Room not found');
        }

        // Find the bed within the room
        const bed = room.beds.find(bed => bed.bedNumber === bedNumber);
        if (!bed) {
            throw new Error('Bed not found in the specified room');
        }
        if (bed.status !== 'available') {
            throw new Error('Bed is not available');
        }

        // Update bed status to 'occupied'
        bed.status = 'occupied';

        // Save the updated room (which includes the updated bed status)
        await room.save();

        return bed;
    } catch (error) {
        throw new Error('Failed to assign bed: ' + error.message);
    }
};


const getAllHostelUsers = async (req, res) => {
    const userId = req.userId;
    const { date } = req.query; // Extracting date from query parameters

    try {
        const selectedDate = new Date(date);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1); 
        // Find hostel users whose end date falls within the range from the selected date to the next day
        let hostelUsers = await HostelUser.find({
            userId,
            endDate: { $gte: selectedDate, $lt: nextDay }
        }).select('endDate amount name mobile');

        // Map over the hostelUsers to format the endDate
        hostelUsers = hostelUsers.map(user => ({
            ...user._doc, // Spread in the rest of the properties
            endDate: user.endDate.toISOString().split('T')[0] // Format the endDate to display date only
        }));
        res.status(200).json(hostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getHostelUserById = async (req, res) => {
    const userId = req.userId;
    try {
        const hostelUser = await HostelUser.findById(userId);
        if (hostelUser) {
            res.status(200).json(hostelUser);
        } else {
            res.status(404).json({ message: 'Hostel user not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// const updateHostelUserById = async (req, res, userId, id) => {
//     try {
//         console.log('Received PUT request to update user with ID:', id);
//         console.log('Request body:', req.body);

//         const { bed: newBedNumber, floor: newFloorId, room: newRoomId, ...userData } = req.body;

//         const hostelUser = await HostelUser.findById(id);
//         if (!hostelUser) {
//             return res.status(404).json({ success: false, message: 'Hostel user not found' });
//         }

//         if (newBedNumber && newBedNumber !== hostelUser.bed) {
//             const newBed = await assignBed(newFloorId.toString(), newRoomId.toString(), newBedNumber);
//             if (!newBed) {
//                 return res.status(400).json({ success: false, message: 'Failed to assign new bed' });
//             }
//             const oldRoom = await Room.findById(hostelUser.room);
//             if (oldRoom) {
//                 oldRoom.beds.find(bed => bed.bedNumber === hostelUser.bed).status = 'available';
//                 await oldRoom.save();
//             }
//             hostelUser.bed = newBedNumber;
//             hostelUser.room = newRoomId;
//         }

//         if (newFloorId && newRoomId && (newFloorId.toString() !== hostelUser.floor.toString() || newRoomId.toString() !== hostelUser.room.toString())) {
//             hostelUser.floor = newFloorId;
//             hostelUser.room = newRoomId;
//         }

//         // Update user's details
//         Object.assign(hostelUser, userData);

//         const updatedUser = await hostelUser.save();
//         console.log('User updated successfully:', updatedUser);

//         res.status(200).json({ success: true, message: 'User updated successfully', hostelUser: updatedUser });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };


const updateHostelUserById = async (req, res, userId, id) => {
    try {
        console.log('Received PUT request to update user with ID:', id);
        console.log('Request body:', req.body);

        const { bed: newBedNumber, floor: newFloorId, room: newRoomId, ...userData } = req.body;

        const hostelUser = await HostelUser.findById(id);
        if (!hostelUser) {
            return res.status(404).json({ success: false, message: 'Hostel user not found' });
        }

        if (newBedNumber && newBedNumber !== hostelUser.bed) {
            const newBed = await assignBed(newFloorId.toString(), newRoomId.toString(), newBedNumber);
            if (!newBed) {
                return res.status(400).json({ success: false, message: 'Failed to assign new bed' });
            }
            const oldRoom = await Room.findById(hostelUser.room);
            if (oldRoom) {
                oldRoom.beds.find(bed => bed.bedNumber === hostelUser.bed).status = 'available';
                await oldRoom.save();
            }
            hostelUser.bed = newBedNumber;
            hostelUser.room = newRoomId;
        }

        if (newFloorId && newRoomId && (newFloorId.toString() !== hostelUser.floor.toString() || newRoomId.toString() !== hostelUser.room.toString())) {
            hostelUser.floor = newFloorId;
            hostelUser.room = newRoomId;
        }

        // Update user's details
        Object.assign(hostelUser, userData);

        const updatedUser = await hostelUser.save();
        console.log('User updated successfully:', updatedUser);

        res.status(200).json({ success: true, message: 'User updated successfully', hostelUser: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

 

// const deleteHostelUserById = async (req, res) => {
//     const id = req.params.id; // Correctly access the id parameter from req.params
//     try {
//         const deletedHostelUser = await HostelUser.findByIdAndDelete(id);
//         if (deletedHostelUser) {
//             res.status(200).json({ message: 'Hostel user deleted successfully' });
//         } else {
//             res.status(404).json({ message: 'Hostel user not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


const deleteHostelUserById = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedHostelUser = await HostelUser.findByIdAndDelete(id);
        if (deletedHostelUser) {
            // Update bed status to "available"
            const oldRoom = await Room.findById(deletedHostelUser.room);
            if (oldRoom) {
                const bedToUpdate = oldRoom.beds.find(bed => bed.bedNumber === deletedHostelUser.bed);
                if (bedToUpdate) {
                    bedToUpdate.status = 'available';
                    await oldRoom.save(); // Save the updated room with the available bed status
                }
            }
            res.status(200).json({ message: 'Hostel user deleted successfully' });
        } else {
            res.status(404).json({ message: 'Hostel user not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getAllStudentHostelUsers = async (req, res) => {
    try {
        const userId = req.userId;
        const hostelUsers = await HostelUser.find({ userId, userType: 'student' });
        // const studentHostelUsers = await HostelUser.find({ userType: 'student' });
        res.status(200).json(hostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllWorkingEmployeeHostelUsers = async (req, res) => {
    const userId = req.userId;
    try {
        const workingEmployeeHostelUsers = await HostelUser.find({userId, userType: 'working emp' });
        res.status(200).json(workingEmployeeHostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllGuestHostelUsers = async (req, res) => {
    const userId = req.userId;
    try {
        const guestHostelUsers = await HostelUser.find({userId, userType: 'guest' });
        res.status(200).json(guestHostelUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

 
const getAvailableBeds = async (floorNumber, roomNumber) => {
    try {
        const room = await Room.findOne({ floor: floorNumber, roomNumber });
        if (!room) {
            throw new Error('Room not found');
        }

        // Filter available beds within the room
        const availableBeds = room.beds.filter(bed => bed.status === 'available');

        return availableBeds;
    } catch (error) {
        throw new Error('Failed to get available beds: ' + error.message);
    }
};


const renderCreateFormWithAvailableBeds = async (req, res) => {
    try {
        // Fetch available floors
        const floors = await Floor.find().lean();
        const availableFloors = floors.map(floor => ({
            floorNumber: floor.floorNumber,
            rooms: floor.rooms.map(room => ({
                roomNumber: room.roomNumber,
                availableBeds: room.totalBeds - room.occupiedBeds
            }))
        }));

        res.render('createHostelUser', { availableFloors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const processPayment = async (req, res) => {
    try {
        const { userReferenceId, ...paymentDetails } = req.body;

        // Find the hostel user by userReferenceId
        const hostelUser = await HostelUser.findOne({ userReferenceId });
        if (!hostelUser) {
            return res.status(404).json({ message: 'Hostel user not found' });
        }

        // Update payment details
        hostelUser.paymentDetails = paymentDetails;

        // If payment status is 'paid', update billing details for next cycle
        if (paymentDetails.paymentStatus === 'paid') {
            // Update billing cycle and calculate new end date
            const { billingCycle, billingDate } = hostelUser;
            const newEndDate = calculateEndDate(billingCycle, billingDate);
            hostelUser.endDate = newEndDate;

            // Example: update next billing amount based on billing cycle
            if (billingCycle === 'monthly') {
                hostelUser.billingAmount = hostelUser.amount; // Assuming the same amount for the next month
            } else if (billingCycle === 'quarterly') {
                hostelUser.billingAmount = hostelUser.amount * 3; // Assuming quarterly billing
            } else if (billingCycle === 'yearly') {
                hostelUser.billingAmount = hostelUser.amount * 12; // Assuming yearly billing
            }
        }
        
        // Save the updated hostel user
        await hostelUser.save();

        // Respond with success message
        res.status(200).json({ message: 'Payment processed successfully' });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Payment processing failed' });
    }
};






module.exports = {
    getAllHostelUsers,
    createHostelUser,
    getHostelUserById,
    updateHostelUserById,
    deleteHostelUserById,
    getAllStudentHostelUsers,
    getAllWorkingEmployeeHostelUsers,
    getAllGuestHostelUsers,
    getAvailableBeds,
    renderCreateFormWithAvailableBeds,
    assignBed,
    processPayment
};
