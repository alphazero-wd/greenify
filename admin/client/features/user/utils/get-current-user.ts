import axios from "axios";
import { cookies } from "next/headers";
import { User } from "../types/user";

export const getCurrentUser = async () => {
  try {
    const { data } = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/auth/me",
      {
        headers: { Cookie: cookies().toString() },
      },
    );
    return data?.data as User | undefined;
  } catch (error) {
    console.log({ error });
  }
};
