content = open(r'client\src\pages\HomePage.jsx', encoding='utf-8').read()

# Lines 145-148 currently:
# "                      </div>\n"   22 spaces - closes flex items div (line 137)
# "                    </div>\n"     20 spaces - closes absolute bottom-4 div (line 127)
# "                  </div>\n"       18 spaces - should close gradient div (line 125) but closes rounded-2xl (line 116)
# "                </div>\n"         16 spaces - closes backdrop-blur div (line 115)

# We need to insert one extra closing div after the 20-space one:
old = '                      </div>\n                    </div>\n                  </div>\n                </div>\n'
new = '                      </div>\n                    </div>\n                    </div>\n                  </div>\n                </div>\n'

if old in content:
    content = content.replace(old, new, 1)
    print("Fixed! Inserted missing closing div for gradient overlay.")
else:
    print("Pattern not found")
    # Try without trailing newline
    old2 = '                      </div>\n                    </div>\n                  </div>\n                </div>'
    if old2 in content:
        new2 = '                      </div>\n                    </div>\n                    </div>\n                  </div>\n                </div>'
        content = content.replace(old2, new2, 1)
        print("Fixed with pattern2!")
    else:
        print("Pattern2 also not found, printing context:")
        idx = content.find('                    </div>\n                  </div>\n                </div>')
        if idx >= 0:
            print(repr(content[idx-100:idx+200]))

open(r'client\src\pages\HomePage.jsx', 'w', encoding='utf-8').write(content)
print("Saved.")
