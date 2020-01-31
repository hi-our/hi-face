/*
 * The constants for HJPassport
 */


const  errorMap = {
  404        : 'no_network',
  999        : 'sys_err',

  1001       : 'no_login',
  1002       : 'data_null',
  1003       : 'para_error',
  1004       : 'captcha_wrong',
  1005       : 'request_err',
  1006       : 'sms_wrong',
  1007       : 'action_deny',
  1008       : 'sms_exceed_times',

  1101       : 'account_frozen',
  1102       : 'match_username_pwd',
  1103       : 'username_inexist',
  1104       : 'username_blocked',
  1105       : 'interest_exist',

  1201       : 'third_unlogin',
  1202       : 'third_binded',
  1203       : 'has_bound',
  1204       : 'bind_fail',
  1205       : 'third_register_fail',
  1210       : 'sign_up_fail',
  1211       : 'match_username_pwd',
  1212       : 'has_modify_username',
  1213       : 'username_reach_limit',
  1214       : 'username_is_used',
  1215       : 'username_same_old',
  1216       : 'change_username_overdue',
  1220       : 'spec_username_unexisted',
  1221       : 'username_null',
  1222       : 'username_invalid',
  1223       : 'pwd_null',
  1224       : 'pwd_invalid',
  1225       : 'pwd_twice_diff',
  1226       : 'pwd_wrong',

  1300       : 'interest_null',
  1301       : 'username_unallowed',
  1302       : 'mobile_exist',
  1303       : 'email_exist',
  1304       : 'username_exist',
  1305       : 'format_err',
  1306       : 'too_busy',
  1307       : 'sign_up_fail',
  1308       : 'same_username_pwd',
  1360       : 'username_same_old',
  1361       : 'change_username_overdue',
  1362       : 'change_username_overdue',

  1401       : 'sms_repeat_fetch',
  1402       : 'sms_exceed_limit',
  1403       : 'sms_send_fail',

  1501       : 'mobile_unregister',
  1502       : 'email_unregister',
  1503       : 'pwd_find_invalid',
  1504       : 'email_redirect_err',
  1505       : 'third_not_bind',
  1506       : 'email_invalid',
  1507       : 'third_info_fail',

  1601       : 'only_app_call',
  1602       : 'anonymous_info_fail',
  1603       : 'anonymous_trans_fail',

  1701       : 'invalid_token',
  1702       : 'exceed_call_limit',

  13011      : 'username_exist'
}

export default errorMap;
