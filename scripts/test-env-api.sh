#!/bin/bash

# 环境变量管理 API 测试脚本 (包含 Cordova 预设)
# 使用方法: ./test-env-api.sh

BASE_URL="http://localhost:3000/env"

echo "======================================"
echo "环境变量管理 API 测试 (含 Cordova 预设)"
echo "======================================"
echo ""

# 1. 获取所有环境配置
echo "1. 获取所有环境配置"
echo "GET $BASE_URL/profiles"
curl -s -X GET "$BASE_URL/profiles" | jq .
echo ""
echo "---"
echo ""

# 2. 获取当前激活的配置
echo "2. 获取当前激活的配置"
echo "GET $BASE_URL/current"
curl -s -X GET "$BASE_URL/current" | jq .
echo ""
echo "---"
echo ""

# 3. 获取默认配置
echo "3. 获取默认配置"
echo "GET $BASE_URL/default"
curl -s -X GET "$BASE_URL/default" | jq .
echo ""
echo "---"
echo ""

# 4. 获取所有 Cordova 预设配置
echo "4. 获取所有 Cordova 预设配置"
echo "GET $BASE_URL/cordova-presets"
curl -s -X GET "$BASE_URL/cordova-presets" | jq .
echo ""
echo "---"
echo ""

# 5. 获取特定的 Cordova 预设配置
echo "5. 获取 Cordova 13 CA:15 预设配置"
echo "GET $BASE_URL/cordova-presets/cordova-13-ca15"
curl -s -X GET "$BASE_URL/cordova-presets/cordova-13-ca15" | jq .
echo ""
echo "---"
echo ""

# 6. 从 Cordova 预设创建配置
echo "6. 从 Cordova 13 CA:15 预设创建配置"
echo "POST $BASE_URL/create-from-cordova"
curl -s -X POST "$BASE_URL/create-from-cordova" \
  -H "Content-Type: application/json" \
  -d '{
    "presetName": "cordova-13-ca15",
    "profileName": "my-cordova-app"
  }' | jq .
echo ""
echo "---"
echo ""

# 7. 从另一个 Cordova 预设创建配置
echo "7. 从 Cordova 12 CA:11 预设创建配置"
echo "POST $BASE_URL/create-from-cordova"
curl -s -X POST "$BASE_URL/create-from-cordova" \
  -H "Content-Type: application/json" \
  -d '{
    "presetName": "cordova-12-ca11"
  }' | jq .
echo ""
echo "---"
echo ""

# 8. 查看所有配置(包含新创建的)
echo "8. 获取所有环境配置(更新后)"
echo "GET $BASE_URL/profiles"
curl -s -X GET "$BASE_URL/profiles" | jq .
echo ""
echo "---"
echo ""

# 9. 切换到 Cordova 13 CA:15 配置
echo "9. 切换到 my-cordova-app 配置"
echo "POST $BASE_URL/switch"
curl -s -X POST "$BASE_URL/switch" \
  -H "Content-Type: application/json" \
  -d '{"profileName": "my-cordova-app"}' | jq .
echo ""
echo "---"
echo ""

# 10. 查看当前配置
echo "10. 查看当前配置"
echo "GET $BASE_URL/current"
curl -s -X GET "$BASE_URL/current" | jq .
echo ""
echo "---"
echo ""

# 11. 切换到 Cordova 12 CA:11 配置
echo "11. 切换到 cordova-12-ca11 配置"
echo "POST $BASE_URL/switch"
curl -s -X POST "$BASE_URL/switch" \
  -H "Content-Type: application/json" \
  -d '{"profileName": "cordova-12-ca11"}' | jq .
echo ""
echo "---"
echo ""

# 12. 尝试删除当前激活的配置(应该失败)
echo "12. 尝试删除当前激活的配置(预期失败)"
echo "DELETE $BASE_URL/delete/cordova-12-ca11"
curl -s -X DELETE "$BASE_URL/delete/cordova-12-ca11" | jq .
echo ""
echo "---"
echo ""

# 13. 切换回默认配置
echo "13. 切换回默认配置"
echo "POST $BASE_URL/switch"
curl -s -X POST "$BASE_URL/switch" \
  -H "Content-Type: application/json" \
  -d '{"profileName": "default"}' | jq .
echo ""
echo "---"
echo ""

# 14. 删除自定义配置
echo "14. 删除 my-cordova-app 配置"
echo "DELETE $BASE_URL/delete/my-cordova-app"
curl -s -X DELETE "$BASE_URL/delete/my-cordova-app" | jq .
echo ""
echo "---"
echo ""

# 15. 删除 Cordova 预设配置
echo "15. 删除 cordova-12-ca11 配置"
echo "DELETE $BASE_URL/delete/cordova-12-ca11"
curl -s -X DELETE "$BASE_URL/delete/cordova-12-ca11" | jq .
echo ""
echo "---"
echo ""

# 16. 最终查看所有配置
echo "16. 最终查看所有配置"
echo "GET $BASE_URL/profiles"
curl -s -X GET "$BASE_URL/profiles" | jq .
echo ""
echo "---"
echo ""

echo "======================================"
echo "测试完成!"
echo "======================================"
echo ""
echo "注意: 配置切换后需要重启应用才能生效"
echo ""
echo "可用的 Cordova 预设:"
echo "  - cordova-12-ca11  (Cordova 12 + android 11.0.x)"
echo "  - cordova-12-ca12  (Cordova 12 + android 12.0.x)"
echo "  - cordova-13-ca13  (Cordova 13 + android 13.0.x)"
echo "  - cordova-13-ca14  (Cordova 13 + android 14.0.x)"
echo "  - cordova-13-ca15  (Cordova 13 + android 15.0.x)"
