/**
 * Wraps a promise and returns a tuple instead of throwing for expected errors.
 *
 * - On success: returns `[undefined, data]`
 * - On handled error: returns `[error]`
 * - On unhandled error: re-throws the error
 *
 * @template T Resolved value type of the input promise.
 * @template E Error class constructor type used in `errorsToCatch`.
 * @param promise Promise to execute safely.
 * @param errorsToCatch Optional list of error classes to catch. If omitted, all
 * errors are caught and returned as `[error]`.
 * @returns A tuple containing either the resolved data or a handled error.
 *
 * @example
 * class ValidationError extends Error {}
 * class UnauthorizedError extends Error {}
 *
 * async function createUser() {
 *   return { id: 'u_1', name: 'Aki' }
 * }
 *
 * const [error, user] = await safeFetchWithErrors(
 *   createUser(),
 *   [ValidationError, UnauthorizedError],
 * )
 *
 * if (error !== undefined) {
 *   // Handle only expected errors here.
 *   console.error(error.message)
 *   return
 * }
 *
 * console.log(user.id)
 */
export async function safeFetchWithErrors<
  T,
  E extends new (...args: unknown[]) => Error,
>(
  promise: Promise<T>,
  errorsToCatch?: E[]
): Promise<[undefined, T] | [InstanceType<E>]> {
  return promise
    .then((data) => [undefined, data] as [undefined, T])
    .catch((error) => {
      if (errorsToCatch === undefined) {
        return [error]
      }

      if (errorsToCatch.some((e) => error instanceof e)) {
        return [error]
      }

      throw error
    })
}
