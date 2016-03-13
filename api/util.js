/**
 * Prepares and Sends Response to Client
 *
 * @function
 * @param {object} err Object Describing Error (if any)
 * @param {string} errMessage Client-Readable Text Describing Problem With Request; May Be Included With Or Without err value 
 * @param {object} res Response Object from Request
 * @param {object} responseDetails Data to Include in Response to Client
 * @returns {json} JSON Object Returned to Client
 */
var finalizeResponse = function(err, errMessage, res, responseDetails) {
  res.json({
    status: (!!err) ? 'failed' : 'success',
    message: errMessage || 'success',
    data: responseDetails || {}   
  });
};

module.exports = {
  finalizeResponse: finalizeResponse
};
