# API Documentation

## Check Image Expiration

Endpoint: `GET /v1/uploads/:filename`

**Description:** This API endpoint is used to check the expiration status of an image based on its filename.

**Parameters:**
`:filename` - The filename of the image to check.

**Example:**
`GET /v1/uploads/1688694172946.png`
Response: `{"filename":"1688694172946.png","expired":"yes"}`

## Usage Examples

### Node.js

```javascript
// Using Axios library
const axios = require('axios');

axios.get('http://file.sazumiviki.me/v1/uploads/1688694172946.png')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
```
## Python

```python
# Using Requests library
import requests

response = requests.get('http://file.sazumiviki.me/v1/uploads/1688694172946.png')
if response.status_code == 200:
  data = response.json()
  print(data)
else:
  print('Error:', response.status_code)
````
## Ruby

```ruby
# Using Net::HTTP library
require 'net/http'
require 'json'

url = URI.parse('http://file.sazumiviki.me/v1/uploads/1688694172946.png')
http = Net::HTTP.new(url.host, url.port)
response = http.request(Net::HTTP::Get.new(url.request_uri))

if response.code == '200'
  data = JSON.parse(response.body)
  puts data
else
  puts 'Error:', response.code
end
```
## Golang

```golang
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	url := "http://file.sazumiviki.me/v1/uploads/1688694172946.png"

	resp, err := http.Get(url)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println(string(body))
}
```
**Note:** Make sure to replace the URL and filename with the appropriate values in the code examples.
