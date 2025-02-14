import { z as zod } from "zod";
import { fromError } from "zod-validation-error";

// create zod schema
const zodSchema = zod.object({
  id: zod.number().int().positive(),
  email: zod.string().email(),
});

// parse some invalid value
function test() {
  try {
    zodSchema.parse({
      id: 5,
      email: "test.com", // note: invalid email
    });
  } catch (err) {
    console.log(err);
    const validationError = fromError(err);
    // the error is now readable by the user
    // you may print it to console
    console.log(validationError.toString());
    // or return it as an actual error
    return validationError;
  }
}
test();
