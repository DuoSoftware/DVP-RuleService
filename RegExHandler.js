var GenerateRegEx = function(dataVal, regExMethod)
{
    switch(regExMethod) {
        case 'StartWith':
        {
            return "^(" + dataVal + ")[^\\s]*";
        }
            break;
        case 'ExactMatch':
        {
            return "^" + dataVal + "$"
        }
            break;
        case 'Any':
        {
            return "[^\\s]*";
        }
            break;
        case 'Custom':
        {
            return dataVal;
        }
            break;
        default :
        {
            return "[^\\s]*";
        }
    }
};

module.exports.GenerateRegEx = GenerateRegEx;