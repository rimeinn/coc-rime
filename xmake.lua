-- luacheck: ignore 113 143
---@diagnostic disable: undefined-global
add_rules("mode.debug", "mode.release")

add_requires("rime", "node-addon-api")

target("rime")
do
    set_languages("cxx17")
    add_rules("nodejs.module")
    add_packages("rime", "node-addon-api")
    add_files("src/*.cc")
end
