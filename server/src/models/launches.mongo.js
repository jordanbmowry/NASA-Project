const mongoose = equire('mongoose');

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    required: true,
    type: Number,
  },
  launchDate: {
    required: true,
    type: Date,
  },
  mission: {
    type: String,
    required: true,
  },
  rockets: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
  customers: [String],
});
