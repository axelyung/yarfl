import rewire from "rewire"
const fieldReducer = rewire("./fieldReducer")
const createFocusFieldReducer = fieldReducer.__get__("createFocusFieldReducer")
const createBlurFieldReducer = fieldReducer.__get__("createBlurFieldReducer")
// @ponicode
describe("createFocusFieldReducer", () => {
    test("0", () => {
        let callFunction: any = () => {
            createFocusFieldReducer()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("createBlurFieldReducer", () => {
    test("0", () => {
        let callFunction: any = () => {
            createBlurFieldReducer()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("fieldReducer.createClearFieldReducer", () => {
    test("0", () => {
        let callFunction: any = () => {
            fieldReducer.createClearFieldReducer()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("fieldReducer.createResetFieldReducer", () => {
    test("0", () => {
        let callFunction: any = () => {
            fieldReducer.createResetFieldReducer()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("fieldReducer.createValidateFieldReducer", () => {
    test("0", () => {
        let callFunction: any = () => {
            fieldReducer.createValidateFieldReducer()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("fieldReducer.createShowFieldErrorsReducer", () => {
    test("0", () => {
        let callFunction: any = () => {
            fieldReducer.createShowFieldErrorsReducer()
        }
    
        expect(callFunction).not.toThrow()
    })
})
