import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.asPromise();
  }

  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.on('connected', resolve);
    });
    return mongoose.connection.asPromise();
  }

  try {
    const mongooseinstance = await mongoose.connect(process.env.MONGO_URL);
    console.log("Database Connected Successfully");
    return mongooseinstance;
  } catch (error) {
    console.log("Database Connection Failed !");
    console.log("Database Error : ",error);
  }
};

export default connectDB;