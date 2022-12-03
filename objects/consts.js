const SIZE_MAP = new Map([
    ['g', 3],
    ['group', 3],
    ['squad', 3],
    ['three', 3],
    ['trio', 3],
    ['few', 3],
    ['two', 2],
    ['duo', 2],
    ['couple', 2],
    ['one', 1],
    ['3', 3],
    ['2', 2],
    ['1', 1],
])

const SEARCH_TYPES = Object.freeze({
    'lf': 0,
    'queue': 1, 
});

module.exports = {
    SIZE_MAP,
    SEARCH_TYPES,
}