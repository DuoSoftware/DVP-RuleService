var GenerateRegEx = function(dataVal, regExMethod)
{
    switch(regExMethod) {
        case 'STARTWITH':
        {
            return "^(" + dataVal + ")[^\\s]*";
        }
            break;
        case 'EXACTMATCH':
        {
            return "^" + dataVal + "$"
        }
            break;
        case 'ANY':
        {
            return "[^\\s]*";
        }
            break;
        case 'CUSTOM':
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