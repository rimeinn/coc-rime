#include "traits.h"

using Napi::ObjectWrap, Napi::CallbackInfo, Napi::Value, Napi::Object,
    Napi::Function, Napi::String, Napi::Number;

Object Traits::Init(Napi::Env env, Object exports) {
  Function func = DefineClass(
      env, "Traits",
      {InstanceAccessor<&Traits::Get_shared_data_dir,
                        &Traits::Set_shared_data_dir>("shared_data_dir"),
       InstanceAccessor<&Traits::Get_user_data_dir, &Traits::Set_user_data_dir>(
           "user_data_dir"),
       InstanceAccessor<&Traits::Get_log_dir, &Traits::Set_log_dir>("log_dir"),
       InstanceAccessor<&Traits::Get_distribution_name,
                        &Traits::Set_distribution_name>("distribution_name"),
       InstanceAccessor<&Traits::Get_distribution_code_name,
                        &Traits::Set_distribution_code_name>(
           "distribution_code_name"),
       InstanceAccessor<&Traits::Get_distribution_version,
                        &Traits::Set_distribution_version>(
           "distribution_version"),
       InstanceAccessor<&Traits::Get_app_name, &Traits::Set_app_name>(
           "app_name"),
       InstanceAccessor<&Traits::Get_min_log_level, &Traits::Set_min_log_level>(
           "min_log_level")});

  exports.Set("Traits", func);
  return exports;
}

Traits::Traits(const CallbackInfo &info) : ObjectWrap<Traits>(info) {
  RIME_STRUCT_INIT(RimeTraits, traits);

  Object obj;
  if (info[0].IsNull())
    obj = Object::New(info.Env()).As<Object>();
  else
    obj = info[0].As<Object>();

  if (obj.Has("shared_data_dir"))
    traits.shared_data_dir =
        strdup(obj.Get("shared_data_dir").As<String>().Utf8Value().c_str());
  if (obj.Has("user_data_dir"))
    traits.user_data_dir =
        strdup(obj.Get("user_data_dir").As<String>().Utf8Value().c_str());
  if (obj.Has("log_dir"))
    traits.log_dir =
        strdup(obj.Get("log_dir").As<String>().Utf8Value().c_str());
  if (obj.Has("distribution_name"))
    traits.distribution_name =
        strdup(obj.Get("distribution_name").As<String>().Utf8Value().c_str());
  if (obj.Has("distribution_code_name"))
    traits.distribution_code_name = strdup(
        obj.Get("distribution_code_name").As<String>().Utf8Value().c_str());
  if (obj.Has("distribution_version"))
    traits.distribution_version = strdup(
        obj.Get("distribution_version").As<String>().Utf8Value().c_str());
  if (obj.Has("app_name"))
    traits.app_name =
        strdup(obj.Get("app_name").As<String>().Utf8Value().c_str());
  if (obj.Has("min_log_level"))
    traits.min_log_level = obj.Get("min_log_level").As<Number>().Int64Value();

  rime = rime_get_api();
  rime->setup(&traits);
  rime->initialize(&traits);
}

Value Traits::Get_shared_data_dir(const CallbackInfo &info) {
  return String::New(info.Env(), traits.shared_data_dir);
}

void Traits::Set_shared_data_dir(const CallbackInfo &info,
                                 const Napi::Value &value) {
  traits.shared_data_dir = value.As<String>().Utf8Value().c_str();
}

Value Traits::Get_user_data_dir(const CallbackInfo &info) {
  return String::New(info.Env(), traits.user_data_dir);
}

void Traits::Set_user_data_dir(const CallbackInfo &info,
                               const Napi::Value &value) {
  traits.user_data_dir = value.As<String>().Utf8Value().c_str();
}

Value Traits::Get_log_dir(const CallbackInfo &info) {
  return String::New(info.Env(), traits.log_dir);
}

void Traits::Set_log_dir(const CallbackInfo &info, const Napi::Value &value) {
  traits.log_dir = value.As<String>().Utf8Value().c_str();
}

Value Traits::Get_distribution_name(const CallbackInfo &info) {
  return String::New(info.Env(), traits.distribution_name);
}

void Traits::Set_distribution_name(const CallbackInfo &info,
                                   const Napi::Value &value) {
  traits.distribution_name = value.As<String>().Utf8Value().c_str();
}

Value Traits::Get_distribution_code_name(const CallbackInfo &info) {
  return String::New(info.Env(), traits.distribution_code_name);
}

void Traits::Set_distribution_code_name(const CallbackInfo &info,
                                        const Napi::Value &value) {
  traits.distribution_code_name = value.As<String>().Utf8Value().c_str();
}

Value Traits::Get_distribution_version(const CallbackInfo &info) {
  return String::New(info.Env(), traits.distribution_version);
}

void Traits::Set_distribution_version(const CallbackInfo &info,
                                      const Napi::Value &value) {
  traits.distribution_version = value.As<String>().Utf8Value().c_str();
}

Value Traits::Get_app_name(const CallbackInfo &info) {
  return String::New(info.Env(), traits.app_name);
}

void Traits::Set_app_name(const CallbackInfo &info, const Napi::Value &value) {
  traits.app_name = value.As<String>().Utf8Value().c_str();
}

Value Traits::Get_min_log_level(const CallbackInfo &info) {
  return Number::New(info.Env(), traits.min_log_level);
}

void Traits::Set_min_log_level(const CallbackInfo &info,
                               const Napi::Value &value) {
  traits.min_log_level = value.As<Number>().Int32Value();
}
