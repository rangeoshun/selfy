'use strict';

var prompt = require('prompt');
prompt.start();

function model ()
{
  return {
    list: [],
    series: []
  };
}

const LEX = [[]];

function pattern ( _str )
{
  const str = _str + '';
  const arr = str.split('');

  return arr.reduce(toPattern, model());
}

function toPattern( _acc, _str )
{
  const acc = _acc || model();
  const str = _str + '';
  const list = ([]).concat(acc.list);
  const series = ([]).concat(acc.series);
  const index = (list || []).indexOf(str);

  if (index > -1) {
    return {
      list: list.filter(() => true),
      series: series.concat(index)
    };
  }

  return {
    list: list.concat(str),
    series: series.concat(list.length)
  };
}

function toI ( _, _i )
{
  return _i | 0;
}

function lex ( _pattern )
{
  const pattern = _pattern || model();
  const list = ([]).concat(_pattern.list);

  return list;
}

function addToLex ( _list, _str )
{
  const list = _list || [];
  const str = _str + '';
  const index = list.indexOf(str);

  if (index > -1) {
    return list;
  }

  return list.concat(str);
}

function mergeLex ( _to, _from )
{
  const to = _to || [];
  const from = _from || [];
  const merged = from.reduce(addToLex, to);

  return merged.reduce(addToLex, to);
}

function normalize ( _pattern, _lex )
{
  const pattern = _pattern || model();
  const list = pattern.list || [];
  const series = pattern.series || [];
  const lex = _lex || [];

  return series.map(( sym ) => lex.indexOf(list[sym]));
}

function matchSeries ( _s1, _s2 )
{
  const s1 = _s1 || [];
  const start = s1.length || 0;
  const s2 = _s2 || [];
  const k = s2.length - (s1.length - start);
  let verdict = true;
  let i = start;

  for (i; i > 1; i--)
  {
    if (s1[i] != s2[k])
    {
      verdict = false;
      break;
    }
  }

  return verdict;
}

function byAscLength ( _one, _two )
{
  const one = (_one || []).length || 0;
  const two = (_two || []).length || 0;

  return one - two;
}

function compareTwo ( _one, _two )
{
  const one = _one || [];
  const two = _two || [];
  let buff = [];

  for (let i in one)
  {
    if (buff.length) break;
    
    const end = one.length - i;
    
    if (end < 2) break;
    
    const partOne = one.slice(0, end);

    if (matchSeries(partOne, two)) {
      buff = buff.concat([partOne]);
    }
  }

  return buff;
}

function compareSeries ( _one )
{
  return function _comSer ( _buff, _two, _i )
  {
    return (_buff || [])
      .concat(
        compareTwo(_one || [], _two || [])
      );
  };
}

function toMatches ( _acc, _series, _i, _all )
{
  const all = (_all || []);

  return (_acc || [])
    .concat(
      all
        .slice((_i || 0) + 1, (all.length || 0))
        .reduce(
          compareSeries(_series || []),
          []
        )
      );
}

function findMatches ( _arr )
{
  return (_arr || [])
    .sort(byAscLength)
    .reduce(toMatches, []);
}

function input ()
{
  prompt.get(
    '>',
    handleInput
  );
}

function handleInput (err, result)
{
  if (!result)
  {
    console.log('\n^C? Bye!');
    return;
  }

  const input = result['>'];
  const patterned = pattern(input);

  LEX[0] = mergeLex(LEX[0], lex(patterned));
  LEX.push(normalize(patterned, LEX[0]));

  console.log(JSON.stringify(patterned));
  console.log(JSON.stringify(LEX));
  console.log(JSON.stringify(
    findMatches(LEX.slice(1,LEX.length))
  ));

  prompt.get(
    '>',
    handleInput
  );
}

input();