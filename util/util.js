module.exports = {
    zeroPad(number) {
        return (number < 10) ? ('0' + number) : number;
    },

    nanToZero(number) {
        return isNaN(number) ? 0 : number;
    },

    dataContainsAll(data, ...values) {
        for(let value of values) if(!data.hasOwnProperty(value)) return false;
        return true;
    },

    dataContainsSingle(data, ...values) {
        for(let value of values) if(data.hasOwnProperty(value)) return true;
        return false;
    }
}