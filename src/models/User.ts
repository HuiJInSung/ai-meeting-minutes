import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true }, // bcrypt 雜湊，不存明碼
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

// 熱更新會重新執行這個檔案：先移除舊的 model 再註冊，才會套用最新的欄位設定
if (models.User) deleteModel("User");
export const UserModel: Model<User> = model<User>("User", userSchema);
