@echo off
REM 环境变量管理 API 测试脚本 (Windows版本)
REM 使用方法: test-env-api.bat

set BASE_URL=http://localhost:3000/env

echo ======================================
echo 环境变量管理 API 测试
echo ======================================
echo.

REM 1. 获取所有环境配置
echo 1. 获取所有环境配置
echo GET %BASE_URL%/profiles
curl -s -X GET "%BASE_URL%/profiles"
echo.
echo ---
echo.

REM 2. 获取当前激活的配置
echo 2. 获取当前激活的配置
echo GET %BASE_URL%/current
curl -s -X GET "%BASE_URL%/current"
echo.
echo ---
echo.

REM 3. 获取默认配置
echo 3. 获取默认配置
echo GET %BASE_URL%/default
curl -s -X GET "%BASE_URL%/default"
echo.
echo ---
echo.

REM 4. 保存新的开发环境配置
echo 4. 保存开发环境配置
echo POST %BASE_URL%/save
curl -s -X POST "%BASE_URL%/save" ^
  -H "Content-Type: application/json" ^
  -d "{\"profileName\":\"development\",\"profile\":{\"sdk\":\"33.0.0\",\"gradle\":\"8.0\",\"java\":\"17\",\"node\":\"20.0.0\"}}"
echo.
echo ---
echo.

REM 5. 保存生产环境配置
echo 5. 保存生产环境配置
echo POST %BASE_URL%/save
curl -s -X POST "%BASE_URL%/save" ^
  -H "Content-Type: application/json" ^
  -d "{\"profileName\":\"production\",\"profile\":{\"sdk\":\"34.0.0\",\"gradle\":\"8.5\",\"java\":\"21\",\"node\":\"22.0.0\"}}"
echo.
echo ---
echo.

REM 6. 再次获取所有配置,确认已保存
echo 6. 获取所有环境配置(更新后)
echo GET %BASE_URL%/profiles
curl -s -X GET "%BASE_URL%/profiles"
echo.
echo ---
echo.

REM 7. 切换到开发环境
echo 7. 切换到开发环境
echo POST %BASE_URL%/switch
curl -s -X POST "%BASE_URL%/switch" ^
  -H "Content-Type: application/json" ^
  -d "{\"profileName\":\"development\"}"
echo.
echo ---
echo.

REM 8. 查看当前配置
echo 8. 查看当前配置
echo GET %BASE_URL%/current
curl -s -X GET "%BASE_URL%/current"
echo.
echo ---
echo.

REM 9. 尝试删除当前激活的配置(应该失败)
echo 9. 尝试删除当前激活的配置(预期失败)
echo DELETE %BASE_URL%/delete/development
curl -s -X DELETE "%BASE_URL%/delete/development"
echo.
echo ---
echo.

REM 10. 切换回默认配置
echo 10. 切换回默认配置
echo POST %BASE_URL%/switch
curl -s -X POST "%BASE_URL%/switch" ^
  -H "Content-Type: application/json" ^
  -d "{\"profileName\":\"default\"}"
echo.
echo ---
echo.

REM 11. 删除开发环境配置
echo 11. 删除开发环境配置
echo DELETE %BASE_URL%/delete/development
curl -s -X DELETE "%BASE_URL%/delete/development"
echo.
echo ---
echo.

REM 12. 删除生产环境配置
echo 12. 删除生产环境配置
echo DELETE %BASE_URL%/delete/production
curl -s -X DELETE "%BASE_URL%/delete/production"
echo.
echo ---
echo.

REM 13. 最终查看所有配置
echo 13. 最终查看所有配置
echo GET %BASE_URL%/profiles
curl -s -X GET "%BASE_URL%/profiles"
echo.
echo ---
echo.

echo ======================================
echo 测试完成!
echo ======================================
echo.
echo 注意: 配置切换后需要重启应用才能生效
pause
