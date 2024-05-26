CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(512) NOT NULL,
    ip VARCHAR(255) NOT NULL,
	timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'::text)
);

"
1. Проверяем юзеров c таким айпи, если больше 2, то салам алейкум
2. При каждом заходе добавляем токен в таблицу tokens
3. Проверяем по таблице tokens + validate
+ удаляем refresh like user refresh
+ daemon на каждую неделю
+ добавить timespamp
+ капчу прикрутить
"

"
-- sessions --
1. Будем записывать ip, браузер, устройство, последний заход
"