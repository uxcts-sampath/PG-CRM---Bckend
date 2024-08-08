
    const mongoose = require('mongoose');
    const { ObjectId } = mongoose.Types;
    const HostelUser = require('../models/hostelUsers');
    const jwt = require('jsonwebtoken');
    const Room = require('../models/rooms')
    const fs = require('fs');
    const path = require('path');
    const csv = require("csv-parser")
    const excelToJson = require("convert-excel-to-json");
    const { MongoClient } = require('mongodb');





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
                floor, room, bed, paymentType, amount, billingCycle, billingDate, billingAmount, payment,profilePhoto,
                ...userData
            } = req.body;


            if (req.file) {
                // Save the file details to your database or perform necessary actions
                userData.profilePhoto = req.file.filename;  // Assuming you save the filename to the user data
            }

            const userId = req.userId;
            const parsedBillingAmount = parseFloat(billingAmount);
            const userReferenceId = generateRandomUserReferenceId();
            // const floorId = new ObjectId(floor);
            const roomId = new ObjectId(room);
            const foundRoom = await Room.findById(roomId);
            if (!foundRoom) {
                return res.status(404).json({ message: 'Room not found' });
            }
          
            const isBedAvailable = foundRoom.beds.some(b => b.bedNumber === parseInt(bed) && b.status === 'available');

            if (!isBedAvailable) {
                return res.status(400).json({ message: 'Bed not available' });
            }
            foundRoom.beds.find(b => b.bedNumber === parseInt(bed)).status = 'occupied';
            
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
                // floor: floorId,
                room: roomId,
                bed,
                paymentType,
                amount,
                billingCycle,
                billingDate,
                endDate,
                userReferenceId,
                profilePhoto:userData.profilePhoto,
                paymentHistory: [{
                    ...initialPayment,
                    outstanding: pendingAmount // Set initial outstanding value
                }]
            });
            await hostelUser.save();
            res.status(201).json({ ...hostelUser.toJSON(), endDate, userReferenceId,profilePhoto:userData.profilePhoto });
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
            // Access the form data fields excluding 'bed'
            const { bed, billingAmount, ...userData } = req.body;
    
            // Validate and handle billingAmount
            let validBillingAmount;
            if (billingAmount && !isNaN(parseFloat(billingAmount))) {
                validBillingAmount = parseFloat(billingAmount);
            } else {
                validBillingAmount = 0; // Or any default value or logic suitable for your application
            }
    
    
            // Access the files if any (e.g., profilePhoto)
            const profilePhoto = req.file;
    
            const hostelUser = await HostelUser.findById(id);
            if (!hostelUser) {
                return res.status(404).json({ success: false, message: 'Hostel user not found' });
            }
    
            // Update user's details excluding 'bed' and handling 'billingAmount'
            Object.assign(hostelUser, userData);
            hostelUser.billingAmount = validBillingAmount;
    
            // Optionally handle the profile photo if it's part of the update
            if (profilePhoto) {
                hostelUser.profilePhoto = profilePhoto.filename; // Example: Assuming you save the filename
            }
    
            const updatedUser = await hostelUser.save();
    
    
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
                newEndDate = calculateEndDate(hostelUser.billingCycle, billingDate); 
                // Calculate the payable amount only if it's a new billing cycle
                const payableAmount = calculatePayableAmount(hostelUser, paymentDetails);
                hostelUser.payableAmount = payableAmount;
            }
    
            const amountPaid = paymentDetails.subTotal - paymentDetails.customAmount;
    
            const outstanding = calculateOutstanding(hostelUser, paymentDetails);
    
            hostelUser.paymentHistory.push({
                billingDate: paymentDetails.billingDate,
                payment: paymentDetails.payment,
                outstanding: outstanding,
                subTotal: paymentDetails.subTotal,
                customAmount: amountPaid, // Update customAmount to amountPaid
                total: paymentDetails.total,
                amountPaid: paymentDetails.customAmount
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


    const deleteProfilePhoto = async (req, res) => {
        const { id } = req.params;
      
        try {
          // Fetch the hostel user by id to get the profile photo filename
          const hostelUser = await HostelUser.findById(id);
          if (!hostelUser) {
            return res.status(404).json({ success: false, message: 'Hostel user not found' });
          }
      
          // Construct the path to the profile photo
          const filePath = path.join(__dirname, '../public/images', hostelUser.profilePhoto);
      
          // Check if the file exists
          if (fs.existsSync(filePath)) {
            // Delete the file
            fs.unlinkSync(filePath);
      
            // Update the hostel user record to remove profile photo reference
            await HostelUser.findByIdAndUpdate(id, { $unset: { profilePhoto: '' } });
      
            return res.status(200).json({ success: true, message: 'Profile photo deleted successfully' });
          } else {
            return res.status(404).json({ success: false, message: 'Profile photo not found' });
          }
        } catch (error) {
          console.error('Error deleting profile photo:', error);
          return res.status(500).json({ success: false, message: 'Failed to delete profile photo', error: error.message });
        }
      };


    
    //   const bulkUploadHostelUsers = async (req, res) => {
    //     try {
    //         if (!req.file) {
    //             return res.status(400).json({ success: false, message: 'No file uploaded' });
    //         }
    
    //         const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    //         if (!fs.existsSync(uploadsDir)) {
    //             fs.mkdirSync(uploadsDir, { recursive: true });
    //         }
    
    //         const filePath = path.join(uploadsDir, req.file);

    //         res.json({
    //             msg: "File Uploaded",
    //             file: req.file?.filename,
    //           });

    //         const results = [];
    
    //         fs.createReadStream(filePath)
    //             .on('error', (error) => {
    //                 console.error('Error reading file:', error);
    //                 res.status(500).json({ success: false, message: 'Error reading file', error: error.message });
    //             })
    //             .pipe(csv())
    //             .on('headers', (headers) => {
    //                 console.log('CSV Headers:', headers);
    //                 // Validate headers here if needed
    //             })
    //             .on('data', (data) => {
    //                 console.log('Parsed data:', data);
    
    //                 // Map data from CSV to userData object
    //                 const userData = {
    //                     userType: data['User Type'],
    //                     name: data['Name'],
    //                     gender: data['Gender'],
    //                     age: parseInt(data['Age']) || null,
    //                     mobile: data['Mobile Number'],
    //                     email: data['Email Address'],
    //                     aadharNumber: data['Aadhar Number'],
    //                     purposeFor: data['Purpose For'],
    //                     address: data['Address'],
    //                     residenceCity: data['City'],
    //                     state: data['State'],
    //                     parentName: data['Parent Name'],
    //                     parentMobileNumber: data['Parent Mobile Number'],
    //                     parentEmailAddress: data['Parent Email Address'],
    //                     referenceBy: data['Reference By'],
    //                     requireRoomType: data['Require Room Type'], // Ensure this matches CSV header
    //                     billingCycle: data['Billing Cycle'], // Ensure this matches CSV header
    //                     paymentType: data['Payment Type'], // Ensure this matches CSV header
    //                     userReferenceId: generateRandomUserReferenceId(),
    //                 };
    
    //                 console.log('Mapped user data:', userData);
    
    //                 // Validate required fields
    //                 const missingFields = [];
    //                 if (!userData.userType) missingFields.push('User Type');
    //                 if (!userData.name) missingFields.push('Name');
    //                 if (!userData.gender) missingFields.push('Gender');
    //                 if (!userData.age) missingFields.push('Age');
    //                 if (!userData.mobile) missingFields.push('Mobile Number');
    //                 if (!userData.aadharNumber) missingFields.push('Aadhar Number');
    //                 if (!userData.address) missingFields.push('Address');
    //                 if (!userData.residenceCity) missingFields.push('City');
    //                 if (!userData.state) missingFields.push('State');
    //                 if (!userData.requireRoomType) missingFields.push('Require Room Type');
    //                 if (!userData.billingCycle) missingFields.push('Billing Cycle');
    //                 if (!userData.paymentType) missingFields.push('Payment Type');
    
    //                 if (missingFields.length > 0) {
    //                     console.error(`Missing required fields: ${missingFields.join(', ')}`);
    //                     return; // Skip saving this record if required fields are missing
    //                 }
    
    //                 results.push(userData);
    //             })
    //             .on('end', async () => {
    //                 try {
    //                     // Insert all valid records into the database
    //                     const savedUsers = await HostelUser.insertMany(results);
    //                     console.log('CSV file successfully processed');
    //                     res.status(200).json({ success: true, message: 'File uploaded and data processed successfully', data: savedUsers });
    //                 } catch (error) {
    //                     console.error('Error saving hostel users:', error);
    //                     res.status(500).json({ success: false, message: 'Error saving hostel users', error: error.message });
    //                 }
    //             });
    
    //     } catch (error) {
    //         console.error('Error in bulkUploadHostelUsers:', error.message);
    //         res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    //     }
    // };
    
    
    
      
    const bulkUploadHostelUsers = async (req, res) => {
        try {
          // Check if file is uploaded
          if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
          }

      
          const filePath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);


      
          // Convert Excel to JSON
          const excelData = excelToJson({
            sourceFile: filePath,
            sheets: [
              {
                name: 'Users',
                header: {
                  rows: 1,
                },
                columnToKey: {
                  A: 'userType',
                  B: 'name',
                  C: 'gender',
                  D: 'age',
                  E: 'mobile',
                  F: 'emailAddress',
                  G: 'aadharNumber',
                  H: 'purposeFor',
                  I: 'address',
                  J: 'residenceCity',
                  K: 'state',
                  L: 'fatherName',
                  M: 'parentPhoneNumber',
                  N: 'parentEmailAddress',
                  O: 'referenceBy',
                  P: 'billingCycle',
                  Q: 'payment',
                  R: 'requireRoomType',
                }
              }
            ]
          });

          console.log('Excel Data:', excelData);


      
          // Check if data exists
          if (!excelData['Users'] || excelData['Users'].length === 0) {
            console.log('No data found in the "Users" sheet.');
            throw new Error('No data found in the "Users" sheet.');
          }
      
       // Process each user and add userId and randomId
       const usersData = excelData['Users'].map(user => {
        return {
            ...user,
            userId: req.userId, // Add userId from request
            userReferenceId: generateRandomUserReferenceId(), // Generate random ID
        };
    });

     // Insert the processed data into the database
     const result = await HostelUser.insertMany(usersData);

      
          //Clean up uploaded file
          fs.unlinkSync(filePath);
          console.log('File successfully deleted.');

      
          res.json({ msg: "File Uploaded and Data Imported" });
        } catch (err) {
          console.error("Error importing data to MongoDB:", err);
          res.status(500).json({ error: "Failed to upload and import file" });
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
        getPaymentDetails,
        deleteProfilePhoto,
        bulkUploadHostelUsers
    };
