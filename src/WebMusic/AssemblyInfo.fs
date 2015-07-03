﻿namespace System
open System.Reflection

[<assembly: AssemblyTitleAttribute("WebMusic")>]
[<assembly: AssemblyProductAttribute("WebMusic")>]
[<assembly: AssemblyDescriptionAttribute("A web music player")>]
[<assembly: AssemblyVersionAttribute("1.0")>]
[<assembly: AssemblyFileVersionAttribute("1.0")>]
do ()

module internal AssemblyVersionInformation =
    let [<Literal>] Version = "1.0"
