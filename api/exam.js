import { NowRequest, NowResponse } from '@vercel/node';

export default (NowRequest, NowResponse) => {
  return NowResponse.json({ message: 'Hello World' });
};
