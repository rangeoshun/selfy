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

let LEX = [[]];

function arr ( item )
{
  return item instanceof Array ? item : [];
}

function pattern ( _str )
{
  const str = _str + '';
  const arr = str.split('');

  return arr.reduce(toPattern, model());
}

function naiveBreak ( _str )
{
  const str = _str + '';
  const length = str.length;
  let patterns = [];
  let i = length;
  let k;

  for (; i > 0; i--)
  {
    const sub = str.slice(0, i);
    patterns = patterns.concat(pattern(sub));
    k = 0;

    for (; k < i; k++)
    {
      const subSub = sub.slice(k, i);
      patterns = patterns.concat(pattern(subSub));
    }
  }

  return onlyUnique(patterns);
}

function equals ( _a, _b )
{
  const a = arr(_a);
  const b = arr(_b);

  return (
    a.length &&
    b.length &&
    a.length === b.length &&
    a.join(',') === b.join(',')
  );
}

function isUnique ( _itemA, _list )
{
  const itemA = arr(_itemA);
  const list = arr(_list);

  for (let _itemB of list)
  {
    const itemB = arr(_itemB);

    if (equals(itemA, itemB))
    {
      return false;
    }
  }

  return true;
}

function onlyUnique ( _list )
{
  const list = arr(_list);

  return list.reduce(
    (acc, item) => (
      isUnique(arr(item), acc)
        ? acc.concat([item])
        : acc
    ),
    []
  );
}

function toPattern ( _acc, _str )
{
  const acc = _acc || model();
  const str = _str + '';
  const list = ([]).concat(acc.list);
  const series = ([]).concat(acc.series);
  const index = arr(list).indexOf(str);

  if (index > -1)
  {
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
  const list = arr(_list);
  const str = _str + '';
  const index = list.indexOf(str);

  if (index > -1)
  {
    return list;
  }

  return list.concat(str);
}

function mergeLex ( _to, _from )
{
  const to = arr(_to);
  const from = arr(_from);
  const merged = from.reduce(addToLex, to);

  return merged.reduce(addToLex, to);
}

function normalize ( _pattern, _lex )
{
  const pattern = _pattern || model();
  const list = arr(pattern.list);
  const series = arr( pattern.series);
  const lex = arr(_lex);

  return series.map(( sym ) => lex.indexOf(list[sym]));
}

function normalizeList ( _list, _lex )
{
  const list = arr(_list);
  const lex = arr(_lex);

  return list.map(( pattern ) => normalize(pattern, lex));
}

function byAscLength ( _one, _two )
{
  const one = arr(_one).length | 0;
  const two = arr(_two).length | 0;

  return one - two;
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
  const lexList = mergeLex(arr(arr(LEX)[0]), lex(patterned));
  const lexPatterns = arr(LEX.slice(1, LEX.length));
  const uniqePatterns = onlyUnique(lexPatterns.concat(normalizeList(naiveBreak(input), lexList)));

  LEX = [lexList].concat(uniqePatterns);

  console.log(JSON.stringify(patterned));
  console.log(JSON.stringify(LEX));

  prompt.get(
    '>',
    handleInput
  );
}

input();