import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/users";

interface UserState {
  name: string | null;
  loading: boolean;
  userInfo: User | null;
}

const initialState: UserState = {
  name: null,
  loading: false,
  userInfo: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUserInfo: (state, action: PayloadAction<User | null>) => {
      state.userInfo = action.payload;
    }
  }
});

export const { setName, setLoading } = userSlice.actions;
export default userSlice.reducer;
