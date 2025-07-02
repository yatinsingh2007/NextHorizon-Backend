const mongoose = require('mongoose');

const oppertunitySchema = mongoose.Schema({
    from_id : {
        type : mongoose.Schema.Types.ObjectId ,
        required : true
    } , 
    to_id : {
        type : mongoose.Schema.Types.ObjectId ,
        required : true
    } , 
    connection_status : {
        type : String ,
        required : true , 
        enum : ['Pending' , 'accepted'] ,
        default : 'Pending'
    }
} , {
    timestamps : true
})

const Oppertunity = mongoose.model('Oppertunity', oppertunitySchema);
module.exports = Oppertunity;