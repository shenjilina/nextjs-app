import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/features/counter/counterSlice";
import userReducer from "@/features/user/userSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      user: userReducer
      // 其他 slices...
    }
    // 可选：添加 middleware、devTools 等
  });
};

// 类型导出（用于 useSelector / useDispatch）
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
