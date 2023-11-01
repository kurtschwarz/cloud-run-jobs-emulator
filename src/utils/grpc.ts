import type { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js'

export const handler = <Request, Response>(
  fn: (call: ServerUnaryCall<Request, Response>) => Promise<Response>
) => (call: ServerUnaryCall<Request, Response>, callback: sendUnaryData<Response>) => {
  try {
    fn(call)
      .then((response) => callback(null, response))
      .catch((error) => callback(error, null))
  } catch (error) {
    callback(error, null)
  }
}
