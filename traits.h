#include <napi.h>
#include <rime_api.h>

class Traits : public Napi::ObjectWrap<Traits> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  Traits(const Napi::CallbackInfo& info);
  RimeApi *rime;
  RimeTraits traits;

 private:
  Napi::Value Get_shared_data_dir(const Napi::CallbackInfo& info);
  void Set_shared_data_dir(const Napi::CallbackInfo& info, const Napi::Value& value);
  Napi::Value Get_user_data_dir(const Napi::CallbackInfo& info);
  void Set_user_data_dir(const Napi::CallbackInfo& info, const Napi::Value& value);
  Napi::Value Get_log_dir(const Napi::CallbackInfo& info);
  void Set_log_dir(const Napi::CallbackInfo& info, const Napi::Value& value);
  Napi::Value Get_distribution_name(const Napi::CallbackInfo& info);
  void Set_distribution_name(const Napi::CallbackInfo& info, const Napi::Value& value);
  Napi::Value Get_distribution_code_name(const Napi::CallbackInfo& info);
  void Set_distribution_code_name(const Napi::CallbackInfo& info, const Napi::Value& value);
  Napi::Value Get_distribution_version(const Napi::CallbackInfo& info);
  void Set_distribution_version(const Napi::CallbackInfo& info, const Napi::Value& value);
  Napi::Value Get_app_name(const Napi::CallbackInfo& info);
  void Set_app_name(const Napi::CallbackInfo& info, const Napi::Value& value);
  Napi::Value Get_min_log_level(const Napi::CallbackInfo& info);
  void Set_min_log_level(const Napi::CallbackInfo& info, const Napi::Value& value);
};
