﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Quiz.Application.Feature.Auth.Commands.LoginUser
{
    public class LoginRequestDto
    {
       
            public string UsernameOrEmail { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        
    }
}
