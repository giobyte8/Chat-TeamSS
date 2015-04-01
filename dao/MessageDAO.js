
/**
 * Data Access Object (DAO) para 'messages'
 * Debe ser construido con un objeto conectado a la
 * base de datos
 */
function MessageDAO(db) {
  
  /**
   * Si el constructor es llamado sin el operados 'new'
   * entonces 'this' apunta al objeto global, muestra una advertencia
   * y lo llama correctamente.
   */
  if (false == (this instanceof MessageDAO)) {
    console.log('WARNING: MessageDAO constructor called without "new" operator');
    return new MessageDAO(db);
  }
  
  /** Colección 'messages' en la base de datos */
  var messages = db.collection('messages');
  
  this.addMessage = function (username, date, message, callback) {
    
    var message = {'username': username, 'date': date, 'message': message};
    messages.insert(message, function (err, result) {
      if (err) return callback(err, null);
      
      console.log('Message saved');
      return callback(null, result[0]);
    });
  }
  
  this.getLatest = function (limit, callback) {
    var qryOptions = {
      'sort': [['date', 'desc']],
      'limit': limit
    }
    
    messages.find({}, qryOptions).toArray(function (err, rmessages) {
      if (err) return callback(err, null);
      return callback(null, rmessages);
    });
  }
  
}

module.exports.MessageDAO = MessageDAO;