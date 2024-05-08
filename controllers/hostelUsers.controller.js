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







    const createHostelUser = async (req, res) => {
        try {
            const {
                floor, room, bed, paymentType, amount, billingCycle, billingDate, billingAmount, payment,
                ...userData
            } = req.body;
            const userId = req.userId;
            const parsedBillingAmount = parseFloat(billingAmount);
            const userReferenceId = generateRandomUserReferenceId();
            const floorId = new ObjectId(floor);
            const roomId = new ObjectId(room);
            const foundRoom = await Room.findById(roomId);
            if (!foundRoom) {
                return res.status(404).json({ message: 'Room not found' });
            }
            const isBedAvailable = foundRoom.beds.some(b => b.bedNumber === bed && b.status === 'available');
            if (!isBedAvailable) {
                return res.status(400).json({ message: 'Bed not available' });
            }
            foundRoom.beds.find(b => b.bedNumber === bed).status = 'occupied';
            
            // let endDate;
            
            // if (billingCycle === 'monthly') {
            //     endDate = calculateEndDate(billingCycle, billingDate);
            // }



            let endDate = calculateEndDate(billingCycle, billingDate);


            // Calculate pending amount if any
            const pendingAmount = amount - parsedBillingAmount;

            const initialPayment = {
                billingDate,
                billingAmount: parsedBillingAmount,
                amountPaid: parsedBillingAmount,
                paymentStatus: 'paid',
                pendingAmount,
                payment
            };

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
                endDate,
                userReferenceId,
                paymentHistory: [{
                    ...initialPayment,
                    outstanding: pendingAmount // Set initial outstanding value
                }]
            });
            await hostelUser.save();
            res.status(201).json({ ...hostelUser.toJSON(), endDate, userReferenceId });
            await foundRoom.save();
        } catch (error) {
            console.error('Error creating hostel user:', error);
            res.status(400).json({ message: error.message });
        }
    };







    const generateRandomUserReferenceId = () => {
        return Math.floor(10000 + Math.random() * 90000);
    };





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

            console.log(hostelUsers)
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



    const updateHostelUserById = async (req, res, userId, id) => {
        try {

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
            // console.log('User updated successfully:', updatedUser);

            res.status(200).json({ success: true, message: 'User updated successfully', hostelUser: updatedUser });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };


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


    
    

    // const processPayment = async (req, res) => {
    //     try {
    //         const { userReferenceId, paymentDetails } = req.body;
    
    //         if (isNaN(paymentDetails.subTotal) || isNaN(paymentDetails.total)) {
    //             return res.status(400).json({ success: false, message: 'Invalid payment details' });
    //         }
    
    //         const hostelUser = await HostelUser.findOne({ userReferenceId });
    //         if (!hostelUser) {
    //             return res.status(404).json({ message: 'Hostel user not found' });
    //         }
    
    //         let newEndDate = hostelUser.endDate; // Initialize newEndDate with the existing endDate
    
    //         // Check if billingDate is greater than endDate
    //         const billingDate = new Date(paymentDetails.billingDate);
    //         if (billingDate > hostelUser.endDate) {
    //             newEndDate = calculateEndDate(hostelUser.billingCycle, billingDate); // Generate new endDate
    //         }
    
    //         const outstanding = calculateOutstanding(hostelUser, paymentDetails);
    
    //         hostelUser.paymentHistory.push({
    //             billingDate: paymentDetails.billingDate,
    //             payment: paymentDetails.payment,
    //             outstanding: outstanding,
    //             subTotal: paymentDetails.subTotal,
    //             customAmount: paymentDetails.customAmount,
    //             total: paymentDetails.total,
    //         });
    
    //         hostelUser.endDate = newEndDate; // Update the endDate
    
    //         await hostelUser.save();
    //         return res.status(200).json({ success: true, message: 'Payment processed successfully', data: hostelUser });
    //     } catch (error) {
    //         console.error('Error processing payment:', error);
    //         res.status(500).json({ message: 'Payment processing failed' });
    //     }
    // };
    


    const processPayment = async (req, res) => {
        try {
            const { userReferenceId, paymentDetails } = req.body;
    
            if (isNaN(paymentDetails.subTotal) || isNaN(paymentDetails.total)) {
                return res.status(400).json({ success: false, message: 'Invalid payment details' });
            }
    
            const hostelUser = await HostelUser.findOne({ userReferenceId });
            if (!hostelUser) {
                return res.status(404).json({ message: 'Hostel user not found' });
            }
    
            let newEndDate = hostelUser.endDate; // Initialize newEndDate with the existing endDate
    
            // Check if billingDate is greater than endDate
            const billingDate = new Date(paymentDetails.billingDate);
            if (billingDate > hostelUser.endDate) {
                newEndDate = calculateEndDate(hostelUser.billingCycle, billingDate); // Generate new endDate
                // Calculate the payable amount only if it's a new billing cycle
                const payableAmount = calculatePayableAmount(hostelUser, paymentDetails);
                hostelUser.payableAmount = payableAmount;
            }
    
            const outstanding = calculateOutstanding(hostelUser, paymentDetails);
    
            hostelUser.paymentHistory.push({ 
                billingDate: paymentDetails.billingDate,
                payment: paymentDetails.payment,
                outstanding: outstanding,
                subTotal: paymentDetails.subTotal,
                customAmount: paymentDetails.customAmount,
                total: paymentDetails.total,
            });
    
            hostelUser.endDate = newEndDate; // Update the endDate
    
            await hostelUser.save();
            return res.status(200).json({ success: true, message: 'Payment processed successfully', data: hostelUser });
        } catch (error) {
            console.error('Error processing payment:', error);
            res.status(500).json({ message: 'Payment processing failed' });
        }
    };
    
    
    
    



    const calculateOutstanding = (hostelUser, paymentDetails) => {
        // Calculate the outstanding amount after deducting custom amount from subtotal
        const outstanding = paymentDetails.subTotal - paymentDetails.customAmount;
        return outstanding;
    };





    const calculateNextMonthBillingAmount = (currentAmount) => {
        // Implement your logic here (e.g., increase by a certain percentage)
        return currentAmount; // For simplicity, assuming the same amount for the next month
    };

    const getPaymentDetails = async (req, res) => {
        try {
            const userReferenceId = req.params.userReferenceId;
            

            // Find the hostel user by userReferenceId
            const hostelUser = await HostelUser.findOne({ userReferenceId });
            if (!hostelUser) {
                return res.status(404).json({ message: 'Hostel user not found' });
            }

            // Respond with the entire hostel user document
            res.status(200).json(hostelUser);
        } catch (error) {
            console.error('Error fetching hostel user details:', error);
            res.status(500).json({ message: 'Failed to fetch hostel user details' });
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
        processPayment,
        getPaymentDetails
    };
