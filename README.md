# Deploy
Deploy allows you to configure a set of projects that automatically update whenever a push is made to Github. 

## Config
Example Configuration:
```
{
        "port": 8000,
        "secret": "secretHash",
        "projects": [
                {
                        "name": "minehut/maps",
                        "directory": "/home/maps"
                },
                {
                        "name": "minehut/rotations",
                        "directory": "/home/rotations"
                }
        ]
}
```

## Notes
This currently only works on Linux. 
